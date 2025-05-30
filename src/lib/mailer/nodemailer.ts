
import { createTransport } from "nodemailer";
import { envVariables } from "@/env.ts";

export interface NodemailerResponse {
  message: string;
  error: boolean;
  success: boolean;
}
export interface NodemailerInputs {
  from: string;
  to: string;
  subject: string;
  text: string;
}

const transporter = createTransport({
    host: envVariables.SMTP_HOST,
    port: 587,
    auth: {
      user:envVariables.SMTP_USER,
       pass:envVariables.SMTP_PASSWORD,
    },
  });

export function nodemailerClient(mailOptions:NodemailerInputs):Promise<NodemailerResponse|Error> {
    return new Promise<NodemailerResponse>((resolve, reject) => {
      transporter.sendMail(mailOptions, (error: unknown) => {
        if (error) {
          if(error instanceof Error){
            reject(error)
          }  
          reject(
            new Error("Error sending email: " + error)
          );
        } else {
          resolve({
            message: "Successfully sent, Thank you!",
            error: false,
            success: true,
          });
        }
      });
    });
  }
