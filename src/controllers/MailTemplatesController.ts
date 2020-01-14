import { Request, Response } from "express";
import { Repository, getConnectionManager, Not } from "typeorm";
import { MailTemplate } from "../entity/MailTemplate";

class MailTemplatesController {
  // Template Routes
  static getTemplate = async (req: Request, res: Response) => {
    const manager = getConnectionManager().get(
      process.env.NODE_ENV === "production" ? "default" : "test"
    );
    const mailTemplateRepository: Repository<MailTemplate> = manager.getRepository(
      MailTemplate
    );
    const mailTemplates = req.body.templateName
      ? await mailTemplateRepository.findOne({
          where: { title: req.params.templateName }
        })
      : await mailTemplateRepository.find();

    return res.status(200).json({
      success: true,
      message: "Successfully fetched templates",
      data: mailTemplates
    });
  };

  static createTemplate = async (req: Request, res: Response) => {
    const manager = getConnectionManager().get(
      process.env.NODE_ENV === "production" ? "default" : "test"
    );
    const mailTemplateRepository: Repository<MailTemplate> = manager.getRepository(
      MailTemplate
    );
    const newTemplate = new MailTemplate();
    const { title, template, templateVars } = req.body;
    newTemplate.title = title;
    newTemplate.template = template;
    newTemplate.templateVars = templateVars;

    try {
      await mailTemplateRepository.save(newTemplate);
    } catch {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: "Successfully created Template",
      data: newTemplate
    });
  };

  static updateTemplate = async (req: Request, res: Response) => {
    const manager = getConnectionManager().get(
      process.env.NODE_ENV === "production" ? "default" : "test"
    );
    const mailTemplateRepository: Repository<MailTemplate> = manager.getRepository(
      MailTemplate
    );
    const { title, template, templateVars, id } = req.body;
    await mailTemplateRepository.update(id, { title, template, templateVars });
    return res.status(200).json({
      success: true,
      message: "Successfully updated template",
      data: await mailTemplateRepository.findOne(id)
    });
  };

  static deleteTemplate = async (req: Request, res: Response) => {
    const manager = getConnectionManager().get(
      process.env.NODE_ENV === "production" ? "default" : "test"
    );
    const mailTemplateRepository: Repository<MailTemplate> = manager.getRepository(
      MailTemplate
    );
    if (req.body.templateId) {
      await mailTemplateRepository.delete(req.body.templateId);
    } else {
      const mailTemplates = await mailTemplateRepository.find({
        where: { title: Not("default") }
      });
      await mailTemplateRepository.remove(mailTemplates);
    }
    return res.status(200).json({
      success: true,
      message: `Template${!req.body.templateId && "s"} successfully deleted`,
      data: await mailTemplateRepository.find()
    });
  };
}

export default MailTemplatesController;
