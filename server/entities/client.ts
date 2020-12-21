import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Client {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  // Argon hash
  @Column({ type: "varchar", length: 95, nullable: false })
  public secret?: string;

  @Column({ type: "varchar", length: 25, nullable: false })
  public name: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  public redirectUri: string;

  @Column({ type: "boolean", default: false })
  public isConfidential: boolean;

  public withoutSecret(): Client {
    delete this.secret;
    return this;
  }
}
