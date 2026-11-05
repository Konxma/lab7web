import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
export enum ClothingSize { XS = 'XS', S = 'S', M = 'M', L = 'L', XL = 'XL' }
@Entity('clothes')
export class ClothingEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar', length: 150 }) title!: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) price!: string;
  @Column({ type: 'enum', enum: ClothingSize }) size!: ClothingSize;
  @Column({ type: 'varchar', length: 80 }) material!: string;
  @Column({ type: 'varchar', length: 50 }) color!: string;
  @CreateDateColumn({ type: 'timestamp with time zone' }) createdAt!: Date;
  @UpdateDateColumn({ type: 'timestamp with time zone' }) updatedAt!: Date;
  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true }) deletedAt!: Date | null;
}
