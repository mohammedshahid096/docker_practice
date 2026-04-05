import * as nodemailer from "nodemailer";
import { Transporter } from "nodemailer";
import * as fs from "fs/promises";
import * as fsSync from "fs";
import * as path from "path";
import JsonTemplatesCollection from "./templateCollection.json" with { type: "json" };

interface PlaceholderData {
  [key: string]: string;
}

interface EmailTemplate {
  fileName: string;
  message: {
    subject: string;
    text?: string;
    html?: string;
  };
}

export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.NODEMAILER_SERVICE,
      host: process.env.NODEMAILER_HOST,
      port: Number(process.env.NODEMAILER_PORT),
      // secure: Number(process.env.NODEMAILER_PORT) === 465,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false, // Only if needed for testing
      },

      connectionTimeout: 50000,
      socketTimeout: 50000,
    });
  }

  private async getTemplateFromFile(
    fileName: string,
    placeholderData: PlaceholderData,
  ): Promise<string | null> {
    const filePath = path.join(__dirname, "templates", fileName);

    if (!fsSync.existsSync(filePath)) {
      return null;
    }

    let fileContent = await fs.readFile(filePath, "utf-8");

    // Replace placeholders {{key}}
    for (const [key, value] of Object.entries(placeholderData)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      fileContent = fileContent.replace(regex, value);
    }

    return fileContent;
  }

  private async getTemplateData(
    templateName: keyof typeof JsonTemplatesCollection,
    subject?: string | null,
    placeholderData: PlaceholderData = {},
  ): Promise<EmailTemplate> {
    // let smtpVerify = await this.transporter.verify();
    // console.log(smtpVerify);
    const template = JsonTemplatesCollection[templateName] as EmailTemplate;

    if (!template) {
      throw new Error(`Email template "${templateName}" not found`);
    }

    const templateFileData = await this.getTemplateFromFile(
      template.fileName,
      placeholderData,
    );

    const subjectTemplate = subject ?? template.message.subject;
    const subjectWithPlaceholders = this.replacePlaceholders(
      subjectTemplate,
      placeholderData,
    );
    const textWithPlaceholders = template.message.text
      ? this.replacePlaceholders(template.message.text, placeholderData)
      : undefined;

    return {
      ...template,
      message: {
        ...template.message,
        subject: subjectWithPlaceholders,
        text: textWithPlaceholders,
        html: templateFileData ?? textWithPlaceholders,
      },
    };
  }

  private replacePlaceholders(
    content: string,
    placeholderData: PlaceholderData,
  ): string {
    let result = content;
    for (const [key, value] of Object.entries(placeholderData)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      result = result.replace(regex, value);
    }
    return result;
  }

  async sendMail(
    to: string | string[],
    templateName: keyof typeof JsonTemplatesCollection,
    subject?: string | null,
    placeholderData: PlaceholderData = {},
    options: { sendMail: boolean } = { sendMail: true },
  ): Promise<any> {
    try {
      const { sendMail } = options;
      if (!sendMail) return;
      const template = await this.getTemplateData(
        templateName,
        subject,
        placeholderData,
      );

      const response = await this.transporter.sendMail({
        from: process.env.NODEMAILER_USER,
        to,
        ...template.message,
      });
      return response;
    } catch (error) {
      // throw new InternalServerErrorException(
      //   'Failed to send email',
      //   error?.message,
      // );
    }
  }
}
