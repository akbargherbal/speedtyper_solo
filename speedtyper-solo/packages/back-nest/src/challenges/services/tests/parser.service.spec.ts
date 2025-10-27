import { getFormattedText } from '../parser.service';

const dubbleNewLineInput = `func newGRPCProxyCommand() *cobra.Command {
  lpc := &cobra.Command{
    Use:   "grpc-proxy <subcommand>",
    Short: "grpc-proxy related command",
  }
  lpc.AddCommand(newGRPCProxyStartCommand())

  return lpc
}`;

const trippleNewLineInput = `func newGRPCProxyCommand() *cobra.Command {
  lpc := &cobra.Command{
    Use:   "grpc-proxy <subcommand>",
    Short: "grpc-proxy related command",
  }
  lpc.AddCommand(newGRPCProxyStartCommand())


  return lpc
}`;

const inputWithTabs = `func newGRPCProxyCommand() *cobra.Command {
\tlpc := &cobra.Command{
\t\tUse:   "grpc-proxy <subcommand>",
\t\tShort: "grpc-proxy related command",
\t}
\tlpc.AddCommand(newGRPCProxyStartCommand())
\treturn lpc
}`;

const inputWithEmptyLineWithSpaces = `func newGRPCProxyCommand() *cobra.Command {
  lpc := &cobra.Command{   
    Use:   "grpc-proxy <subcommand>",
    Short: "grpc-proxy related command",
  }     
   
  lpc.AddCommand(newGRPCProxyStartCommand())
  return lpc
}`;

const inputWithTrailingSpaces = `func newGRPCProxyCommand() *cobra.Command {
  lpc := &cobra.Command{   
    Use:   "grpc-proxy <subcommand>",
    Short: "grpc-proxy related command",
  }     
  lpc.AddCommand(newGRPCProxyStartCommand())
  return lpc
}`;

const inputWithStructAlignment = `func newGRPCProxyCommand() *cobra.Command {
  lpc := &cobra.Command{
    Use:   "grpc-proxy <subcommand>",
    Short: "grpc-proxy related command",
  }
  lpc.AddCommand(newGRPCProxyStartCommand())
  return lpc
}`;

const output = `func newGRPCProxyCommand() *cobra.Command {
  lpc := &cobra.Command{
    Use: "grpc-proxy <subcommand>",
    Short: "grpc-proxy related command",
  }
  lpc.AddCommand(newGRPCProxyStartCommand())
  return lpc
}`;

describe('getFormattedText', () => {
  it('should remove double newlines', () => {
    const parsed = getFormattedText(dubbleNewLineInput);
    expect(parsed).toEqual(output);
  });
  it('should remove tripple newlines', () => {
    const parsed = getFormattedText(trippleNewLineInput);
    expect(parsed).toEqual(output);
  });
  it('should replace tabs with spaces', () => {
    const parsed = getFormattedText(inputWithTabs);
    expect(parsed).toEqual(output);
  });
  it('should return the same if called twice', () => {
    const firstParsed = getFormattedText(inputWithTabs);
    const parsed = getFormattedText(firstParsed);
    expect(parsed).toEqual(output);
  });
  it('should remove trailing spaces', () => {
    const parsed = getFormattedText(inputWithTrailingSpaces);
    expect(parsed).toEqual(output);
  });
  it('should remove empty line with spaces', () => {
    const parsed = getFormattedText(inputWithEmptyLineWithSpaces);
    expect(parsed).toEqual(output);
  });
  it('should dedupe multiple interior spaces', () => {
    const parsed = getFormattedText(inputWithStructAlignment);
    expect(parsed).toEqual(output);
  });
});
