import * as TSParser from 'tree-sitter';
import { Injectable } from '@nestjs/common';
import { getTSLanguageParser } from './ts-parser.factory';

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
  // RELAXED FILTERS: More permissive than original
  private MAX_NODE_LENGTH = 800;  // Was 300
  private MIN_NODE_LENGTH = 100;  // Keep same
  private MAX_NUM_LINES = 25;     // Was 11
  private MAX_LINE_LENGTH = 100;  // Was 55

  constructor(private ts: TSParser) {}

  parseTrackedNodes(content: string) {
    const root = this.ts.parse(content).rootNode;
    return this.filterNodes(root);
  }

  private filterNodes(root: TSParser.SyntaxNode) {
    const nodes = root.children
      .filter((n) => this.filterValidNodeTypes(n))
      .filter((n) => this.filterLongNodes(n))
      .filter((n) => this.filterShortNodes(n))
      .filter((n) => this.filterTooLongLines(n))
      .filter((n) => this.filterTooManyLines(n))
      .map((n) => this.removeCommentsAndDocstrings(n));  // NEW: Remove comments
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
      case NodeTypes.LexicalDeclaration:      // NEW: const/let
      case NodeTypes.VariableDeclaration:     // NEW: var
      case NodeTypes.ArrowFunction:           // NEW: arrow functions
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
   * NEW: Remove comments and docstrings from extracted code
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
      'comment',              // Most languages
      'line_comment',         // C-style
      'block_comment',        // C-style
      'expression_statement', // Python docstrings (check if it contains string)
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
    // Remove lines that are now empty or only whitespace
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
          cleaned.push(''); // Keep one blank line
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