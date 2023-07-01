export class AnnotationResponse {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color: string;

  constructor(
    bold: boolean,
    italic: boolean,
    strikethrough: boolean,
    underline: boolean,
    code: boolean,
    color: string
  ) {
    this.bold = bold;
    this.italic = italic;
    this.strikethrough = strikethrough;
    this.underline = underline;
    this.code = code;
    this.color = color;
  }
}
