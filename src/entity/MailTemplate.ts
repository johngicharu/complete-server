import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  AfterUpdate
} from "typeorm";

@Entity("mailTemplates")
export class MailTemplate {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar")
  title: string;

  @Column("text")
  template: string;

  @Column("text")
  templateVars: string;

  @Column("datetime")
  createdOn: Date;

  @Column("datetime", { nullable: true })
  modifiedOn: Date;

  @BeforeInsert()
  async addValues() {
    this.createdOn = new Date();
  }

  @AfterUpdate()
  async updateDate() {
    this.modifiedOn = new Date();
  }
}
