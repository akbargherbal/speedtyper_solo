import * as TSParser from 'tree-sitter';
import { Injectable } from '@nestjs/common';
import { getTSLanguageParser } from './ts-parser.factory';
import { ParserConfig, DEFAULT_PARSER_CONFIG } from './parser-config.interface';
import * as fs from 'fs';
import * as path from 'path';

// TODO: Chars like ♡ should be filtered out
@Injectable()
export class ParserService {
  getParser(language: string) {
    const tsParser = getTSLanguageParser(language);
    return new Parser(tsParser);
  }
}

export enum NodeTypes {
  ClassDeclaration = 'class_declaration',
  ClassDefinition = 'class_definition',
  FunctionDeclaration = 'function_declaration',
  FunctionDefinition = 'function_definition',
  FunctionItem = 'function_item',
  MethodDeclaration = 'method_declaration',
  MethodDefinition = 'method_definition',
  Module = 'module',
  Call = 'call',
  UsingDirective = 'using_directive',
  NamespaceDeclaration = 'namespace_declaration',
  // NEW: Added for JavaScript/TypeScript modern syntax
  LexicalDeclaration = 'lexical_declaration',
  VariableDeclaration = 'variable_declaration',
  ArrowFunction = 'arrow_function',
}

export class Parser {
  // Configuration loaded from parser.config.json
  private config: ParserConfig;
  private MAX_NODE_LENGTH: number;
  private MIN_NODE_LENGTH: number;
  private MAX_NUM_LINES: number;
  private MAX_LINE_LENGTH: number;
  private REMOVE_COMMENTS: boolean;

  constructor(private ts: TSParser) {
    this.config = this.loadConfig();
    this.MAX_NODE_LENGTH = this.config.filters.maxNodeLength;
    this.MIN_NODE_LENGTH = this.config.filters.minNodeLength;
    this.MAX_NUM_LINES = this.config.filters.maxNumLines;
    this.MAX_LINE_LENGTH = this.config.filters.maxLineLength;
    this.REMOVE_COMMENTS = this.config.parsing.removeComments;
  }

  /**
   * Load parser configuration from parser.config.json
   * Falls back to defaults if file is missing or invalid
   */
  private loadConfig(): ParserConfig {
    try {
      const configPath = path.join(process.cwd(), 'parser.config.json');

      if (!fs.existsSync(configPath)) {
        console.log('[Parser] No parser.config.json found, using defaults');
        return DEFAULT_PARSER_CONFIG;
      }

      const configFile = fs.readFileSync(configPath, 'utf8');
      const parsedConfig = JSON.parse(configFile);

      // Validate config structure
      if (!parsedConfig.filters || !parsedConfig.parsing) {
        console.warn('[Parser] Invalid config structure, using defaults');
        return DEFAULT_PARSER_CONFIG;
      }

      // Validate filter values
      const filters = parsedConfig.filters;
      if (filters.minNodeLength >= filters.maxNodeLength) {
        console.warn('[Parser] Invalid config: minNodeLength must be < maxNodeLength, using defaults');
        return DEFAULT_PARSER_CONFIG;
      }

      if (filters.maxNumLines <= 0 || filters.maxLineLength <= 0) {
        console.warn('[Parser] Invalid config: maxNumLines and maxLineLength must be > 0, using defaults');
        return DEFAULT_PARSER_CONFIG;
      }

      console.log('[Parser] ✅ Loaded custom configuration from parser.config.json');
      console.log(`[Parser] Filters: ${filters.minNodeLength}-${filters.maxNodeLength} chars, max ${filters.maxNumLines} lines, max ${filters.maxLineLength} chars/line`);

      return parsedConfig as ParserConfig;
    } catch (error) {
      console.error('[Parser] Error loading config:', error.message);
      console.log('[Parser] Falling back to default configuration');
      return DEFAULT_PARSER_CONFIG;
    }
  }

  /**
   * ENHANCED: Parse tracked nodes with support for pattern block extraction
   * If file contains PATTERN: markers (// or # style), use block extraction mode
   * Otherwise, fall back to tree-sitter extraction
   */
  parseTrackedNodes(content: string) {
    // Check for pattern markers (supports both // and # comment styles)
    if (content.match(/^(?:\/\/|#)\s*PATTERN:/m)) {
      console.log('[parser]: Detected PATTERN markers, using block extraction mode');
      return this.extractPatternBlocks(content);
    }

    // Default tree-sitter mode
    const root = this.ts.parse(content).rootNode;
    return this.filterNodes(root);
  }

  /**
   * NEW: Extract pattern blocks delimited by PATTERN: markers
   * Supports both // (JS/TS) and # (Python) comment styles
   * Each block is a self-contained code snippet for pattern memorization
   */
  private extractPatternBlocks(content: string): TSParser.SyntaxNode[] {
    const blocks: TSParser.SyntaxNode[] = [];
    
    // Normalize line endings: Convert CRLF (\r\n) to LF (\n)
    const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalizedContent.split('\n');
    
    let currentPattern: string | null = null;
    let currentBlock: string[] = [];
    let blockStartLine = 0;
    let markerCount = 0;

    console.log(`[parser]: Starting pattern extraction from ${lines.length} lines`);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Match both // and # style comments with PATTERN: marker
      // Examples:
      //   // PATTERN: Array Methods
      //   # PATTERN: List Comprehension
      const match = line.match(/^(?:\/\/|#)\s*PATTERN:\s*(.+)$/);

      if (match) {
        markerCount++;
        console.log(`[parser]: Found marker #${markerCount} at line ${i + 1}: "${match[1]}"`);
        
        // Save previous block if exists
        if (currentPattern && currentBlock.length > 0) {
          const blockText = currentBlock.join('\n').trim();
          console.log(`[parser]: Processing previous block (${blockText.length} chars, ${currentBlock.length} lines)`);
          if (this.isValidPatternBlock(blockText)) {
            blocks.push(this.createSyntaxNodeLike(blockText, blockStartLine));
          }
        }

        // Start new block
        currentPattern = match[1].trim();
        currentBlock = [];
        blockStartLine = i + 1;
      } else if (currentPattern) {
        // Accumulate lines for current block (skip empty lines immediately after marker)
        if (currentBlock.length > 0 || line.trim() !== '') {
          currentBlock.push(line);
        }
      }
    }

    // Save final block
    if (currentPattern && currentBlock.length > 0) {
      const blockText = currentBlock.join('\n').trim();
      console.log(`[parser]: Processing final block (${blockText.length} chars, ${currentBlock.length} lines)`);
      if (this.isValidPatternBlock(blockText)) {
        blocks.push(this.createSyntaxNodeLike(blockText, blockStartLine));
      }
    }

    console.log(`[parser]: Found ${markerCount} marker(s), extracted ${blocks.length} valid block(s)`);
    return blocks;
  }

  /**
   * NEW: Validate pattern block against quality filters
   * Uses same filters as tree-sitter extraction for consistency
   */
  private isValidPatternBlock(text: string): boolean {
    const lines = text.split('\n');
    const charCount = text.length;

    // Apply existing filters
    const meetsMinLength = charCount >= this.MIN_NODE_LENGTH;
    const meetsMaxLength = charCount <= this.MAX_NODE_LENGTH;
    const meetsLineCount = lines.length >= 2 && lines.length <= this.MAX_NUM_LINES;
    const meetsLineLength = lines.every(line => line.length <= this.MAX_LINE_LENGTH);

    const isValid = meetsMinLength && meetsMaxLength && meetsLineCount && meetsLineLength;

    // Always log validation attempts for debugging
    console.log(`[parser]: Validating block: ${charCount} chars, ${lines.length} lines`);
    if (!isValid) {
      console.log(`[parser]: ❌ REJECTED:`);
      if (!meetsMinLength) console.log(`  - Below min length (need ${this.MIN_NODE_LENGTH}, got ${charCount})`);
      if (!meetsMaxLength) console.log(`  - Above max length (max ${this.MAX_NODE_LENGTH}, got ${charCount})`);
      if (!meetsLineCount) console.log(`  - Line count outside range (need 2-${this.MAX_NUM_LINES}, got ${lines.length})`);
      if (!meetsLineLength) {
        const longLines = lines.filter(line => line.length > this.MAX_LINE_LENGTH);
        console.log(`  - ${longLines.length} line(s) too long (max ${this.MAX_LINE_LENGTH} chars)`);
        longLines.slice(0, 3).forEach((line, i) => {
          console.log(`    Line ${i + 1} (${line.length} chars): ${line.substring(0, 60)}...`);
        });
      }
    } else {
      console.log(`[parser]: ✅ ACCEPTED`);
    }

    return isValid;
  }

  /**
   * NEW: Create a minimal SyntaxNode-like object for pattern blocks
   * This allows pattern blocks to be processed like tree-sitter nodes
   */
  private createSyntaxNodeLike(text: string, startLine: number): TSParser.SyntaxNode {
    // Create a minimal object that matches SyntaxNode interface
    // Cast to unknown first to bypass strict type checking, then to SyntaxNode
    return {
      text,
      type: 'pattern_block',
      typeId: 0,
      startIndex: 0,
      endIndex: text.length,
      startPosition: { row: startLine, column: 0 },
      endPosition: { row: startLine + text.split('\n').length, column: 0 },
      children: [],
      childCount: 0,
      namedChildren: [],
      namedChildCount: 0,
      parent: null,
      nextSibling: null,
      nextNamedSibling: null,
      previousSibling: null,
      previousNamedSibling: null,
      firstChild: null,
      firstNamedChild: null,
      lastChild: null,
      lastNamedChild: null,
      tree: null as any,
      hasChanges: () => false,
      hasError: () => false,
      isMissing: () => false,
      isNamed: () => true,
      toString: () => text,
      child: () => null,
      namedChild: () => null,
      childForFieldName: () => null,
      firstChildForIndex: () => null,
      firstNamedChildForIndex: () => null,
      descendantForIndex: () => null as any,
      namedDescendantForIndex: () => null as any,
      descendantForPosition: () => null as any,
      namedDescendantForPosition: () => null as any,
      descendantsOfType: () => [],
      walk: () => null as any,
    } as unknown as TSParser.SyntaxNode;
  }

  private filterNodes(root: TSParser.SyntaxNode) {
    const nodes = root.children
      .filter((n) => this.filterValidNodeTypes(n))
      .filter((n) => this.filterLongNodes(n))
      .filter((n) => this.filterShortNodes(n))
      .filter((n) => this.filterTooLongLines(n))
      .filter((n) => this.filterTooManyLines(n))
      .map((n) => this.REMOVE_COMMENTS ? this.removeCommentsAndDocstrings(n) : n);
    return nodes;
  }

  private filterValidNodeTypes(node: TSParser.SyntaxNode) {
    switch (node.type) {
      case NodeTypes.ClassDeclaration:
      case NodeTypes.ClassDefinition:
      case NodeTypes.FunctionDeclaration:
      case NodeTypes.FunctionDefinition:
      case NodeTypes.FunctionItem:
      case NodeTypes.MethodDeclaration:
      case NodeTypes.MethodDefinition:
      case NodeTypes.Module:
      case NodeTypes.Call:
      case NodeTypes.UsingDirective:
      case NodeTypes.NamespaceDeclaration:
      case NodeTypes.LexicalDeclaration:
      case NodeTypes.VariableDeclaration:
      case NodeTypes.ArrowFunction:
        return true;
      default:
        console.log(`[parser]: Skipping node type: ${node.type}`);
        return false;
    }
  }

  private filterLongNodes(node: TSParser.SyntaxNode) {
    return this.MAX_NODE_LENGTH > node.text.length;
  }

  private filterShortNodes(node: TSParser.SyntaxNode) {
    return node.text.length > this.MIN_NODE_LENGTH;
  }

  private filterTooManyLines(node: TSParser.SyntaxNode) {
    const lines = node.text.split('\n');
    return lines.length <= this.MAX_NUM_LINES;
  }

  private filterTooLongLines(node: TSParser.SyntaxNode) {
    for (const line of node.text.split('\n')) {
      if (line.length > this.MAX_LINE_LENGTH) {
        return false;
      }
    }
    return true;
  }

  /**
   * Remove comments and docstrings from extracted code
   * Keeps: imports, function signatures, actual code
   * Removes: comments, docstrings, excessive blank lines
   */
  private removeCommentsAndDocstrings(node: TSParser.SyntaxNode): TSParser.SyntaxNode {
    let cleanedText = node.text;

    // Get all comment nodes from the syntax tree
    const comments = this.findCommentNodes(node);

    // Sort by start position (reverse order to maintain byte offsets)
    comments.sort((a, b) => b.startIndex - a.startIndex);

    // Remove each comment from the text
    for (const comment of comments) {
      const before = cleanedText.substring(0, comment.startIndex);
      const after = cleanedText.substring(comment.endIndex);
      cleanedText = before + after;
    }

    // Clean up formatting
    cleanedText = this.cleanupWhitespace(cleanedText);

    // Return a modified node (we modify the text property)
    return {
      ...node,
      text: cleanedText,
    } as TSParser.SyntaxNode;
  }

  /**
   * Recursively find all comment and docstring nodes
   */
  private findCommentNodes(node: TSParser.SyntaxNode): Array<{ startIndex: number; endIndex: number }> {
    const comments: Array<{ startIndex: number; endIndex: number }> = [];

    // Comment node types vary by language
    const commentTypes = [
      'comment',
      'line_comment',
      'block_comment',
      'expression_statement', // Python docstrings
    ];

    const traverse = (n: TSParser.SyntaxNode) => {
      // Check if this node is a comment
      if (commentTypes.includes(n.type)) {
        // Special case: Python docstrings are expression_statements with string literals
        if (n.type === 'expression_statement') {
          const firstChild = n.children[0];
          if (firstChild && firstChild.type === 'string') {
            comments.push({ startIndex: n.startIndex, endIndex: n.endIndex });
          }
        } else {
          comments.push({ startIndex: n.startIndex, endIndex: n.endIndex });
        }
      }

      // Recurse into children
      for (const child of n.children) {
        traverse(child);
      }
    };

    traverse(node);
    return comments;
  }

  /**
   * Clean up whitespace after comment removal
   */
  private cleanupWhitespace(text: string): string {
    let lines = text.split('\n');

    // Remove trailing/leading blank lines
    while (lines.length > 0 && lines[0].trim() === '') {
      lines.shift();
    }
    while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
      lines.pop();
    }

    // Collapse multiple consecutive blank lines into one
    const cleaned: string[] = [];
    let prevBlank = false;
    for (const line of lines) {
      const isBlank = line.trim() === '';
      if (isBlank) {
        if (!prevBlank) {
          cleaned.push('');
        }
        prevBlank = true;
      } else {
        cleaned.push(line);
        prevBlank = false;
      }
    }

    return cleaned.join('\n');
  }
}

export function removeDuplicateNewLines(rawText: string) {
  const newLine = '\n';
  const duplicateNewLine = '\n\n';
  let newRawText = rawText;
  let prevRawText = rawText;
  do {
    prevRawText = newRawText;
    newRawText = newRawText.replaceAll(duplicateNewLine, newLine);
  } while (newRawText !== prevRawText);
  return newRawText;
}

export function replaceTabsWithSpaces(rawText: string) {
  const tab = '\t';
  const spaces = '  ';
  return rawText.replaceAll(tab, spaces);
}

export function removeTrailingSpaces(rawText: string) {
  return rawText
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n');
}

export function dedupeInnerSpaces(rawText: string) {
  const innerSpaces = /(?<=\S+)\s+(?=\S+)/g;
  const space = ' ';
  return rawText
    .split('\n')
    .map((line) => line.replaceAll(innerSpaces, space))
    .join('\n');
}

export function getFormattedText(rawText: string) {
  rawText = replaceTabsWithSpaces(rawText);
  rawText = removeTrailingSpaces(rawText);
  rawText = removeDuplicateNewLines(rawText);
  rawText = dedupeInnerSpaces(rawText);
  return rawText;
}