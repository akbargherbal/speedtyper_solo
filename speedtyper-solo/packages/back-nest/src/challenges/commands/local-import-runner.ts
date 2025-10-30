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
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║       Speedtyper Local - Snippet Import Tool              ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`📁 Scanning: ${this.SNIPPETS_DIR}\n`);

    // Check if directory exists
    if (!fs.existsSync(this.SNIPPETS_DIR)) {
      console.error('❌ ERROR: Snippets directory not found!');
      console.error(`   Expected location: ${this.SNIPPETS_DIR}`);
      console.error('\n💡 To fix this:');
      console.error('   1. Create the snippets directory: mkdir -p snippets');
      console.error('   2. Add subdirectories: mkdir -p snippets/python snippets/typescript snippets/javascript');
      console.error('   3. Place your code files inside\n');
      process.exit(1);
    }

    // Ensure the project exists
    const project = await this.ensureProject();

    // Scan and import files
    const files = this.scanSnippetsDirectory();
    
    if (files.length === 0) {
      console.log('⚠️  No supported files found in snippets directory!');
      console.log('\n💡 Supported file types:');
      console.log('   JavaScript: .js, .jsx');
      console.log('   TypeScript: .ts, .tsx');
      console.log('   Python: .py');
      console.log('   Others: .java, .go, .rs, .c, .cpp, .cs\n');
      console.log('📝 Add some code files to the snippets directory and run this command again.\n');
      return;
    }

    console.log(`✓ Found ${files.length} file(s) to process\n`);

    let totalChallenges = 0;
    let filesProcessed = 0;
    let filesWithErrors = 0;
    let filesWithNoSnippets = 0;

    for (const file of files) {
      try {
        const challenges = await this.importFile(file, project);
        
        if (challenges.length === 0) {
          filesWithNoSnippets++;
          console.log(`  ⊘ ${file.relativePath} - No valid snippets (file too short or no functions/classes)`);
        } else {
          totalChallenges += challenges.length;
          filesProcessed++;
          console.log(`  ✓ ${file.relativePath} - Extracted ${challenges.length} snippet(s)`);
        }
      } catch (error) {
        filesWithErrors++;
        console.error(`  ✗ ${file.relativePath} - ERROR: ${error.message}`);
      }
    }

    // Summary report
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    Import Summary                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`✅ Success: ${filesProcessed} file(s) processed`);
    console.log(`📦 Snippets: ${totalChallenges} snippet(s) imported`);
    
    if (filesWithNoSnippets > 0) {
      console.log(`⊘  Skipped: ${filesWithNoSnippets} file(s) had no valid snippets`);
      console.log('   💡 Tip: Valid snippets must be 100-300 characters, max 11 lines');
    }
    
    if (filesWithErrors > 0) {
      console.log(`❌ Errors: ${filesWithErrors} file(s) failed to parse`);
    }

    console.log('\n🎮 Ready to practice! Run: npm run dev\n');

    if (totalChallenges === 0) {
      console.log('⚠️  Warning: No snippets were imported!');
      console.log('💡 This usually means:');
      console.log('   • Files are too short (need 100-300 char functions/classes)');
      console.log('   • Files contain only imports/comments');
      console.log('   • Syntax errors preventing parsing\n');
    }
  }

  private async ensureProject() {
    const fullName = 'Local/Practice';
    let project = await this.projectService.findByFullName(fullName);

    if (!project) {
      console.log('📂 Creating "Local/Practice" project...');
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
      console.log('✓ Project created\n');
    }

    return project;
  }

  private scanSnippetsDirectory() {
    const files: Array<{ absolutePath: string; relativePath: string; extension: string }> = [];

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
