import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("mail")
export class Mail {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("text")
  username: string;

  @Column("text")
  email: string;

  @Column("text")
  message: string;

  @Column("boolean")
  replied: boolean;

  @Column("boolean")
  seen: boolean;

  @Column("datetime")
  date: Date;
}
