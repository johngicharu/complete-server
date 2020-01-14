import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  AfterUpdate,
  BaseEntity,
  Unique
} from "typeorm";
import * as bcrypt from "bcryptjs";
import * as gravatar from "gravatar";

export enum UserRoles {
  ADMIN = "admin",
  GUEST = "guest",
  SUBSCRIBER = "subscriber",
  VISITOR = "visitor"
}

const { HASHROUNDS } = process.env;

@Entity("users")
@Unique(["email"])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar", { length: 255 })
  username: string;

  @Column("varchar", { length: 255 })
  email: string;

  @Column("text", { nullable: true })
  password: string | null;

  @Column("boolean", { default: false })
  subscribed: boolean;

  @Column("set", {
    enum: UserRoles,
    default: [UserRoles.VISITOR]
  })
  roles: UserRoles[];

  @Column("varchar")
  avatar: string;

  @Column("datetime")
  createdOn: Date;

  @Column("datetime", { nullable: true })
  modifiedOn: Date;

  @BeforeInsert()
  async addValues() {
    this.createdOn = new Date();
    this.password = this.password
      ? await bcrypt.hash(this.password, Number(HASHROUNDS))
      : null;
    this.avatar = gravatar.url(this.email, {
      s: "200",
      r: "pg",
      d: "mp"
    });
  }

  @AfterUpdate()
  async updateDate() {
    this.modifiedOn = new Date();
    this.password = this.password
      ? await bcrypt.hash(this.password, Number(HASHROUNDS))
      : null;
  }
}
