export class TeXBlock {
  prefix: string;
  content: string;
  suffix: string;

  constructor(prefix: string, content: string, suffix: string) {
    this.prefix = prefix;
    this.content = content;
    this.suffix = suffix;
  }
}