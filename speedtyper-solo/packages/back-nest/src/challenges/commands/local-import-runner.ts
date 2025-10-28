import { Command, CommandRunner } from 'nest-commander';
import { Challenge } from '../entities/challenge.entity';
import { ChallengeService } from '../services/challenge.service';
import { ParserService } from '../services/parser.service';
import { ProjectService } from '../../projects/services/project.service';
import { Project } from '../../projects/entities/project.entity';
import * as fs from 'fs';
import * as path from 'path';

@Command({
  name: 'import-local-snippets',
  arguments: '',
  options: {},
})
export class LocalImportRunner extends CommandRunner {
  private SNIPPETS_DIR = path.join(process.cwd(), '../../snippets');
  
  constructor(
    private parserService: ParserService,
    private challengeService: ChallengeService,
    private projectService: ProjectService,
  ) {
    super();
  }

  async run(): Promise<void> {
    console.log('[local-import]: Starting local snippet import...');
    console.log(`[local-import]: Scanning directory: ${this.SNIPPETS_DIR}`);
    
    // Ensure the project exists
    const project = await this.ensureProject();
    
    // Scan and import files
    const files = this.scanSnippetsDirectory();
    console.log(`[local-import]: Found ${files.length} files to import`);
    
    let totalChallenges = 0;
    let filesProcessed = 0;
    
    for (const file of files) {
      try {
        const challenges = await this.importFile(file, project);
        totalChallenges += challenges.length;
        filesProcessed++;
        
        console.log(
          `[local-import]: ${filesProcessed}/${files.length} - ${file.relativePath} → ${challenges.length} snippets extracted`
        );
      } catch (error) {
        console.error(`[local-import]: ERROR processing ${file.relativePath}:`, error.message);
      }
    }
    
    console.log(`[local-import]: ✅ Complete! Imported ${totalChallenges} snippets from ${filesProcessed} files`);
  }

  private async ensureProject() {
    const fullName = 'Local/Practice';
    let project = await this.projectService.findByFullName(fullName);
    
    if (!project) {
      console.log('[local-import]: Creating Local/Practice project...');
      const newProject = new Project();
      newProject.id = 'local-practice';
      newProject.fullName = fullName;
      newProject.htmlUrl = 'http://localhost:3001';
      newProject.language = 'multi';
      newProject.stars = 0;
      newProject.licenseName = 'MIT';
      newProject.ownerAvatar = '';
      newProject.defaultBranch = 'main';
      
      await this.projectService.bulkUpsert([newProject]);
      project = newProject;
    }
    
    return project;
  }

  private scanSnippetsDirectory() {
    const files: Array<{ absolutePath: string; relativePath: string; extension: string }> = [];
    
    if (!fs.existsSync(this.SNIPPETS_DIR)) {
      throw new Error(`Snippets directory not found: ${this.SNIPPETS_DIR}`);
    }
    
    const scanDir = (dir: string, baseDir: string = this.SNIPPETS_DIR) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          scanDir(fullPath, baseDir);
        } else if (entry.isFile()) {
          const extension = path.extname(entry.name).slice(1);
          const validExtensions = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'go', 'rs', 'c', 'cpp', 'cs'];
          
          if (validExtensions.includes(extension)) {
            files.push({
              absolutePath: fullPath,
              relativePath: path.relative(baseDir, fullPath),
              extension,
            });
          }
        }
      }
    };
    
    scanDir(this.SNIPPETS_DIR);
    return files;
  }

  private async importFile(file: { absolutePath: string; relativePath: string; extension: string }, project: any) {
    // Read file content
    const content = fs.readFileSync(file.absolutePath, 'utf-8');
    
    // Parse nodes using tree-sitter
    const parser = this.parserService.getParser(file.extension);
    const nodes = parser.parseTrackedNodes(content);
    
    if (nodes.length === 0) {
      console.warn(`[local-import]: No valid snippets found in ${file.relativePath}`);
      return [];
    }
    
    // Create challenges from nodes
    const challenges = nodes.map((node, index) => {
      const challenge = new Challenge();
      challenge.id = `local-${file.relativePath.replace(/[\/\\]/g, '-')}-${index}`;
      challenge.sha = `local-sha-${Date.now()}-${index}`;
      challenge.treeSha = `local-tree-${Date.now()}-${index}`;
      challenge.language = this.mapExtensionToLanguage(file.extension);
      challenge.path = file.relativePath;
      challenge.url = `http://localhost:3001/snippets/${file.relativePath}`;
      challenge.content = node.text;
      challenge.project = project;
      
      return challenge;
    });
    
    // Save to database
    await this.challengeService.upsert(challenges);
    
    return challenges;
  }

  private mapExtensionToLanguage(extension: string): string {
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'go': 'go',
      'rs': 'rust',
      'c': 'c',
      'cpp': 'cpp',
      'cs': 'csharp',
    };
    
    return languageMap[extension] || extension;
  }
}