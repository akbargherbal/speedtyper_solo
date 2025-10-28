import { Command, CommandRunner } from 'nest-commander';
import { Challenge } from '../entities/challenge.entity';
import { ChallengeService } from '../services/challenge.service';
import { ProjectService } from '../../projects/services/project.service';
import { ParserService, getFormattedText } from '../services/parser.service';
import { Project } from '../../projects/entities/project.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Command({
  name: 'import-local-snippets',
  arguments: '',
  options: {},
})
export class LocalImportRunner extends CommandRunner {
  private SNIPPETS_DIR = path.join(process.cwd(), '../../snippets');

  constructor(
    private challengeService: ChallengeService,
    private projectService: ProjectService,
    private parserService: ParserService,
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

  private async importFile(
    file: { absolutePath: string; relativePath: string; extension: string },
    project: Project
  ): Promise<Challenge[]> {
    // Read file content
    const content = fs.readFileSync(file.absolutePath, 'utf-8');
    
    // FIXED: Map extension to parser key (not display name)
    const parserLanguage = this.mapExtensionToParserLanguage(file.extension);
    const displayLanguage = this.mapExtensionToDisplayLanguage(file.extension);

    // Use tree-sitter to extract snippets
    const parser = this.parserService.getParser(parserLanguage);
    const nodes = parser.parseTrackedNodes(content);

    if (nodes.length === 0) {
      console.log(`[local-import]: No valid snippets found in ${file.relativePath} (consider adjusting filters)`);
      return [];
    }

    // Create challenges from extracted nodes
    const challenges: Challenge[] = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      
      // Format the extracted code
      const formattedContent = getFormattedText(node.text);

      // Create unique hash for this specific snippet
      const contentHash = crypto
        .createHash('sha256')
        .update(file.relativePath + i + formattedContent)
        .digest('hex')
        .substring(0, 16);

      const challenge = new Challenge();
      challenge.id = `local-${contentHash}`;
      challenge.sha = `sha-${contentHash}`;
      challenge.treeSha = `tree-${contentHash}`;
      challenge.language = displayLanguage;  // Use display name for UI
      challenge.path = `${file.relativePath}#snippet-${i + 1}`;
      challenge.url = `http://localhost:3001/snippets/${file.relativePath}#${i + 1}`;
      challenge.content = formattedContent;
      challenge.project = project;

      challenges.push(challenge);
    }

    // Save to database (upsert handles duplicates)
    await this.challengeService.upsert(challenges);

    return challenges;
  }

  /**
   * FIXED: Map file extension to parser key (what ts-parser.factory.ts expects)
   */
  private mapExtensionToParserLanguage(extension: string): string {
    const parserMap: Record<string, string> = {
      'js': 'js',       // Parser expects 'js'
      'jsx': 'js',      // Parser expects 'js'
      'ts': 'ts',       // Parser expects 'ts'
      'tsx': 'ts',      // Parser expects 'ts'
      'py': 'py',       // Parser expects 'py'
      'java': 'java',   // Parser expects 'java'
      'go': 'go',       // Parser expects 'go'
      'rs': 'rs',       // Parser expects 'rs'
      'c': 'c',         // Parser expects 'c'
      'cpp': 'cpp',     // Parser expects 'cpp'
      'cs': 'cs',       // Parser expects 'cs'
    };

    return parserMap[extension] || extension;
  }

  /**
   * Map file extension to display language (for UI)
   */
  private mapExtensionToDisplayLanguage(extension: string): string {
    const displayMap: Record<string, string> = {
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

    return displayMap[extension] || extension;
  }
}