import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("quote_cache")
export class QuoteCacheEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  symbol!: string;

  @Column({ type: "varchar" })
  date!: string;

  @Column("float")
  open!: number;

  @Column("float")
  close!: number;

  @Column("float")
  high!: number;

  @Column("float")
  low!: number;

  @Column("integer")
  volume!: number;

  @Column({ type: "varchar" })
  dailyChangePercent!: string;

  @CreateDateColumn()
  cachedAt!: Date;
}
