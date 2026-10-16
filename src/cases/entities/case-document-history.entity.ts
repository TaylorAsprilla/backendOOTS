import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Case } from '../../participants/entities/case.entity';
import { Participant } from '../../participants/entities/participant.entity';
import { FamilyMember } from '../../participants/entities/family-member.entity';
import { User } from '../../users/entities/user.entity';
import { CaseDiscussion } from '../../case-discussions/entities/case-discussion.entity';

@Entity('case_document_histories')
export class CaseDocumentHistory {
  @PrimaryColumn({ name: 'case_id', type: 'int', unsigned: true })
  caseId!: number;

  @Column({ name: 'country_id', type: 'int', unsigned: true, nullable: true })
  countryId?: number;

  @Column({ type: 'enum', enum: ['creation', 'legacy'] })
  source!: 'creation' | 'legacy';

  @Column({ name: 'captured_at', type: 'datetime', precision: 6 })
  capturedAt!: Date;

  @Column({ name: 'participant_snapshot', type: 'json' })
  participantSnapshot!: Participant;

  @Column({ name: 'participant_age', type: 'int', nullable: true })
  participantAge?: number;

  @Column({ name: 'family_snapshot', type: 'json' })
  familySnapshot!: FamilyMember[];

  @Column({ name: 'responsible_snapshot', type: 'json', nullable: true })
  responsibleSnapshot?: User;

  @Column({ name: 'closed_at', type: 'datetime', precision: 6, nullable: true })
  closedAt?: Date;

  @Column({ name: 'closed_by_snapshot', type: 'json', nullable: true })
  closedBySnapshot?: User;

  @Column({ name: 'closed_snapshot', type: 'json', nullable: true })
  closedSnapshot?: Case;

  @Column({ name: 'discussions_snapshot', type: 'json', nullable: true })
  discussionsSnapshot?: CaseDiscussion[];
}
