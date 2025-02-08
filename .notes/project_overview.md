# Project Overview

## Goal

Build a web application that allows vendors and manufacturers to manage and share questionaire sheets about the details of their products and manufacturing proccesses.

## Architecture

- **Frontend**:
React with Vite written in TypeScript, styled with Chakra UI, validated with Zod, using the Firebase Authentication SDK, querying data from Firestore, and updating data by triggering callabel Firebase Cloud Functions. The frontend never makes any writes directly to Firestore, all writes are done through the Firebase Cloud Functions. All Data pulled from Firestore is parsed with zod.parse (not zod.safeParse) before being used. All data should be queries using Firestore's realtime listners and stored in the global state so that the UI updates automatically when the database changes.
- **Backend**:
A serverless Firebase project named `Stacks2030` with Google Social Login and Email/Password authentication, a Firestore database protected by security rules that allow only reading, callable Firebase Cloud Functions that validate inputs with zod.parse (not zod.safeParse) and update the database with the Firebase Admin SDK, and SendGrid to send emails.
- **State Management**:
React Context API using global providers to store collections of data and auth state and lower level contexts to manage individual entity state.

## Key Features

- **Authentication**:
Users can register with email/password or Google Social Login, but they must provide a company name when they register.
Registration must be done in one step without needing to supply the company name in a separate step.
The first registered using becomes the admin user.
- **Question Bank**:
Users can add, edit, and delete questions that are saved in Firestore with a relation to their company.
Each question can be of type text, number, boolean, custom multiple choice, or dynamic table that where the question creator defines the columns.
Questions must be tagged with at least one tag.
Boolean and custom multiple choice questions can have branching logic that selects a follow up questions with the same tag based on the answer.
- **Sheets**:
Users can create questionaire sheets by selecting question tags from all their company's questions and providing a recipient email address and company name.
If the recipient is not already a user, they will be sent an invite email with an invite code and a link to an invite registration page that pre-fills their email, and company name but requires them to provide the invite code and a password to register.
- **Responses**:
When a registered user goes to a sheet page that they are invited to by the creator, they fill out the questions and submit their responses.
They can also add comments for each question.
Normally they must answer each question they see, but they can skip a question if they add a comment.
When they save their answers and officially "submit" the sheet response form, an email is sent to the user who created the sheet.
The user who created the sheet can then view the responses and comments and review each question adding comments, and if necessary flagging the answer if there is an issue.
If the creator rejects any answers, the invited user is notified by email and can go back to the sheet to update their answers.
The interface should support a dialogue back and forth between the user who created the sheet and the invited user via their comments and answers.
Once all answers are approved, the sheet is marked as complete and the invited user can no longer edit their answers.
Users who are not the creator or invited user cannot view the questions or responses.
Each sheet is displayed on the frontend on a single page that display the question and response data together in an intuitive way.
- **Invites**:
Users can also send invites to other users by email to add them to their company.
These invites should follow the same flow as the sheet invites.
- **Dashboard**:
The homepage that a user is redirected to after logging or registering with an invite displays an overview of the tagged questions they have created and the sheets they have created or been invited to.
- **Admin**:
The admin user has a special UI page only they can access with a button to trigger a cloud function that deletes all data from the database and all accounts from the Firebase Authentication system.
They are also presented with a table of all data in Firebase Authentication and Firestore that they can view and download as a CSV file.
They can also delete any data from the database or Firebase Authentication system via a cloud function that also deletes all related data.

## Data Model

### Users

```typescript
export const UserSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  email: z.string().email(),
})
```

### Companies

```typescript
export const CompanySchema = z.object({
  id: z.string(),
  name: z.string(),
})
```

### Questions

```typescript
export const QuestionSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  prompt: z.string(),
  tags: z.array(z.string()),
})

export const QuestionOptionSchema = z.object({
  id: z.string(),
  questionId: z.string(),
  value: z.string(),
  branchQuestionIds: z.array(z.string()).nullable(),
})

export const MultipleChoiceQuestionSchema = QuestionSchema.extend({
  type: z.literal('multiple'),
  options: z.array(QuestionOptionSchema),
})

export const BooleanQuestionSchema = QuestionSchema.extend({
  type: z.literal('boolean'),
  trueOption: QuestionOptionSchema,
  falseOption: QuestionOptionSchema,
})

export const TextQuestionSchema = QuestionSchema.extend({
  type: z.literal('text'),
})

export const NumberQuestionSchema = QuestionSchema.extend({
  type: z.literal('number'),
})

export const TableQuestionSchema = QuestionSchema.extend({
  type: z.literal('table'),
  columns: z.array(z.string()),
})
```
### Sheets

```typescript
export const SheetSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  creatorId: z.string(),
  recipientId: z.string(),
})
```

### Invites

```typescript
export const InviteSchema = z.object({
  id: z.string(),
  code: z.string(),
  email: z.string().email(),
  companyId: z.string(),
})
```

### Responses

```typescript
export const ResponseSchema = z.object({
  id: z.string(),
  sheetId: z.string(),
  questionId: z.string(),
  response: z.string(),
  comment: z.string(),
  flagged: z.boolean(),
})
```

## Site Map

### Public Pages

- `/register`
- `/login`
- `/invite/:id`

### Private Pages