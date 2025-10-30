import { pgTable, serial, text, varchar, timestamp, integer, boolean, decimal, real, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userRole = pgEnum('user_role', ['admin', 'manager', 'sales']);
export const leadStatus = pgEnum('lead_status', ['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost']);
export const contactMethod = pgEnum('contact_method', ['email', 'phone', 'meeting', 'sms', 'other']);
export const interactionOutcome = pgEnum('interaction_outcome', ['successful', 'unsuccessful', 'no_answer', 'follow_up_required']);
export const conversionStatus = pgEnum('conversion_status', ['pending', 'completed', 'cancelled']);

export const user = pgTable('user', {
  userId: serial('user_id').primaryKey(),
  fullName: varchar('full_name', { length: 256 }),
  username: varchar('username', { length: 100 }).unique().notNull(),
  email: varchar('email', { length: 256 }).unique().notNull(),
  password: text('password').notNull(), 
  role: userRole('role').notNull(),
  
  teamId: integer('team_id').references(() => team.teamId),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()), 
});

export const team = pgTable('team', {
  teamId: serial('team_id').primaryKey(),
  teamName: varchar('team_name', { length: 256 }).notNull(),
 
  managerId: integer('manager_id').references(() => user.userId),
});

export const customer = pgTable('customer', {
  customerId: serial('customer_id').primaryKey(),
  age: integer('age'),
  job: varchar('job', { length: 100 }),
  maritalStatus: varchar('marital_status', { length: 50 }), 
  education: varchar('education', { length: 100 }),
  hasCreditDefault: boolean('has_credit_default').default(false),
  balance: decimal('balance', { precision: 12, scale: 2 }).default('0.00'), 
  housingLoan: boolean('housing_loan').default(false),
  personalLoan: boolean('personal_loan').default(false),
  
  assignedUserId: integer('assigned_user_id').references(() => user.userId),
  
  predictionScore: real('prediction_score'), 
  customerSegment: varchar('customer_segment', { length: 100 }),
  leadStatus: leadStatus('lead_status'),
  
  lastEngagedAt: timestamp('last_engaged_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

export const interaction = pgTable('interaction', {
  interactionId: serial('interaction_id').primaryKey(),
  
  // Relasi ke Customer dan User
  customerId: integer('customer_id').notNull().references(() => customer.customerId),
  userId: integer('user_id').notNull().references(() => user.userId),
  
  contactMethod: contactMethod('contact_method'),
  durationSeconds: integer('duration_seconds'),
  campaignContact: integer('campaign_contact'),
  previousOutcome: varchar('previous_outcome', { length: 256 }),
  outcome: interactionOutcome('outcome'),
  notes: text('notes'),
  interactionDate: timestamp('interaction_date').defaultNow().notNull(),
});

export const product = pgTable('product', {
  productId: serial('product_id').primaryKey(),
  productName: varchar('product_name', { length: 256 }).notNull(),
  description: text('description'),
});

export const conversion = pgTable('conversion', {
  conversionId: serial('conversion_id').primaryKey(),
  
  // Relasi ke Customer dan Product
  customerId: integer('customer_id').notNull().references(() => customer.customerId),
  productId: integer('product_id').notNull().references(() => product.productId),
  
  conversionDate: timestamp('conversion_date').defaultNow().notNull(),
  status: conversionStatus('status'),
});

export const userRelations = relations(user, ({ many, one }) => ({
  interactions: many(interaction),
  assignedCustomers: many(customer),
  
  teamMembership: one(team, {
    fields: [user.teamId],
    references: [team.teamId],
    relationName: 'team_membership'
  }),
  managedTeams: many(team, {
    relationName: 'team_manager'
  }),
}));

export const teamRelations = relations(team, ({ one, many }) => ({
  manager: one(user, {
    fields: [team.managerId],
    references: [user.userId],
    relationName: 'team_manager'
  }),
  members: many(user, {
    relationName: 'team_membership'
  }),
}));

export const customerRelations = relations(customer, ({ one, many }) => ({
  assignedUser: one(user, {
    fields: [customer.assignedUserId],
    references: [user.userId]
  }),
  interactions: many(interaction),
  conversions: many(conversion),
}));

export const interactionRelations = relations(interaction, ({ one }) => ({
  customer: one(customer, {
    fields: [interaction.customerId],
    references: [customer.customerId]
  }),
  user: one(user, {
    fields: [interaction.userId],
    references: [user.userId]
  }),
}));

export const productRelations = relations(product, ({ many }) => ({
  conversions: many(conversion),
}));

export const conversionRelations = relations(conversion, ({ one }) => ({
  customer: one(customer, {
    fields: [conversion.customerId],
    references: [customer.customerId]
  }),
  product: one(product, {
    fields: [conversion.productId],
    references: [product.productId]
  }),
}));