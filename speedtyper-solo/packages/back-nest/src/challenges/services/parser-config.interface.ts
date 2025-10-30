/**
 * Configuration interface for parser filters
 * Corresponds to parser.config.json in project root
 */
export interface ParserConfig {
  filters: {
    maxNodeLength: number;
    minNodeLength: number;
    maxNumLines: number;
    maxLineLength: number;
  };
  parsing: {
    removeComments: boolean;
    enableCommentSkipping: boolean;
  };
}

/**
 * Default configuration values
 * Used as fallback if config file is missing or invalid
 */
export const DEFAULT_PARSER_CONFIG: ParserConfig = {
  filters: {
    maxNodeLength: 800,
    minNodeLength: 100,
    maxNumLines: 25,
    maxLineLength: 100,
  },
  parsing: {
    removeComments: true,
    enableCommentSkipping: false,
  },
};