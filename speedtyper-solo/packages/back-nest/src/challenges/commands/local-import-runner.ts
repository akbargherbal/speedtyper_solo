import { Command, CommandRunner } from 'nest-commander';
import { Challenge } from '../entities/challenge.entity';
import { ChallengeService } from '../services/challenge.service';
import { ProjectService } from '../../projects/services/project.service';
import { ParserService, getFormattedText } from '../services/parser.service';
import { Project } from '../../projects/entities/project.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  ParserConfig,
  DEFAULT_PARSER_CONFIG,
} from '../services/parser-config.interface';

@Command({
  name: 'import-local-snippets',
  arguments: '',
  options: {},
})
export class LocalImportRunner extends CommandRunner {
  private SNIPPETS_DIR = path.join(process.cwd(), '../../snippets');
  private config: ParserConfig;

  constructor(
    private challengeService: ChallengeService,
    private projectService: ProjectService,
    private parserService: ParserService,
  ) {
    super();
  }

  async run(): Promise<void> {
    this.config = this.loadConfig(); // Load config for summary messages

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║       Speedtyper Local - Snippet Import Tool              ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`📁 Scanning: ${this.SNIPPETS_DIR}\n`);

    if (!fs.existsSync(this.SNIPPETS_DIR)) {
      console.error('❌ ERROR: Snippets directory not found!');
      console.error(`   Expected location: ${this.SNIPPETS_DIR}`);
      console.error('\n💡 To fix this:');
      console.error('   1. Create the snippets directory: mkdir -p snippets');
      console.error('   2. Add subdirectories: mkdir -p snippets/python snippets/typescript snippets/javascript');
      console.error('   3. Place your code files inside\n');
      process.exit(1);
    }

    const project = await this.ensureProject();
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

    // Dynamic summary report
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    Import Summary                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`✅ Success: ${filesProcessed} file(s) processed`);
    console.log(`📦 Snippets: ${totalChallenges} snippet(s) imported`);

    const { minNodeLength, maxNodeLength, maxNumLines } = this.config.filters;

    if (filesWithNoSnippets > 0) {
      console.log(`⊘  Skipped: ${filesWithNoSnippets} file(s) had no valid snippets`);
      console.log(`   💡 Tip: Valid snippets must be ${minNodeLength}-${maxNodeLength} characters, max ${maxNumLines} lines`);
    }

    if (filesWithErrors > 0) {
      console.log(`❌ Errors: ${filesWithErrors} file(s) failed to parse`);
    }

    console.log('\n🎮 Ready to practice! Run: npm run dev\n');

    if (totalChallenges === 0) {
      console.log('⚠️  Warning: No snippets were imported!');
      console.log('💡 This usually means:');
      console.log(`   • Files are too short (need ${minNodeLength}-${maxNodeLength} char functions/classes)`);
      console.log('   • Files contain only imports/comments');
      console.log('   • Syntax errors preventing parsing\n');
    }
  }

  private loadConfig(): ParserConfig {
    try {
      const configPath = path.join(process.cwd(), 'parser.config.json');
      if (!fs.existsSync(configPath)) {
        return DEFAULT_PARSER_CONFIG;
      }
      const configFile = fs.readFileSync(configPath, 'utf8');
      const parsedConfig = JSON.parse(configFile);
      if (!parsedConfig.filters || !parsedConfig.parsing) {
        return DEFAULT_PARSER_CONFIG;
      }
      if (parsedConfig.filters.minNodeLength >= parsedConfig.filters.maxNodeLength) {
        return DEFAULT_PARSER_CONFIG;
      }
      return parsedConfig as ParserConfig;
    } catch {
      return DEFAULT_PARSER_CONFIG;
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
    project: Project,
  ): Promise<Challenge[]> {
    const content = fs.readFileSync(file.absolutePath, 'utf-8');
    const parserLanguage = this.mapExtensionToParserLanguage(file.extension);
    const displayLanguage = this.mapExtensionToDisplayLanguage(file.extension);
    const parser = this.parserService.getParser(parserLanguage);
    const nodes = parser.parseTrackedNodes(content);
    if (nodes.length === 0) return [];

    const challenges: Challenge[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const formattedContent = getFormattedText(node.text);
      const contentHash = crypto
        .createHash('sha256')
        .update(file.relativePath + i + formattedContent)
        .digest('hex')
        .substring(0, 16);
      const challenge = new Challenge();
      challenge.id = `local-${contentHash}`;
      challenge.sha = `sha-${contentHash}`;
      challenge.treeSha = `tree-${contentHash}`;
      challenge.language = displayLanguage;
      challenge.path = `${file.relativePath}#snippet-${i + 1}`;
      challenge.url = `http://localhost:3001/snippets/${file.relativePath}#${i + 1}`;
      challenge.content = formattedContent;
      challenge.project = project;
      challenges.push(challenge);
    }
    await this.challengeService.upsert(challenges);
    return challenges;
  }

  private mapExtensionToParserLanguage(extension: string): string {
    const parserMap: Record<string, string> = {
      js: 'js', jsx: 'js', ts: 'ts', tsx: 'ts', py: 'py', java: 'java', go: 'go', rs: 'rs', c: 'c', cpp: 'cpp', cs: 'cs',
    };
    return parserMap[extension] || extension;
  }

  private mapExtensionToDisplayLanguage(extension: string): string {
    const displayMap: Record<string, string> = {
      js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', py: 'python', java: 'java', go: 'go', rs: 'rust', c: 'c', cpp: 'cpp', cs: 'csharp',
    };
    return displayMap[extension] || extension;
  }
}