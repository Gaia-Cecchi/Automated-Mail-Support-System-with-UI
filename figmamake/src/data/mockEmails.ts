import { Email } from '../types/email';

export const mockEmails: Email[] = [
  {
    id: '1',
    sender: 'john.smith@example.com',
    subject: 'Product inquiry for Northern region',
    body: 'Hello,\n\nI am interested in your services in the Piedmont region. Can you send me a detailed quote for business consulting?\n\nThank you,\nJohn Smith',
    aiSummary: 'Customer interested in consulting services in the North Italy region (Piedmont). Requesting quote.',
    suggestedDepartment: 'North',
    confidence: 92,
    timestamp: new Date('2025-10-21T09:15:00'),
    attachments: [],
    status: 'not_processed',
    aiReasoning: 'The email contains a specific request for the Piedmont region, which belongs to Northern Italy. The customer explicitly mentions business consulting services.'
  },
  {
    id: '2',
    sender: 'julia.white@company.com',
    subject: 'Issue with order #4521',
    body: 'Hello,\n\nI placed an order last week but have not yet received confirmation. Order number: 4521.\n\nWaiting for your urgent response.\n\nJulia White',
    aiSummary: 'Customer complaint about missing confirmation for order #4521. Urgent request.',
    suggestedDepartment: 'Center',
    confidence: 78,
    timestamp: new Date('2025-10-21T10:32:00'),
    attachments: ['payment_receipt.pdf'],
    status: 'not_processed',
    aiReasoning: 'This is a complaint about an unconfirmed order. The urgent tone suggests the need for quick handling by the Center team that manages orders.'
  },
  {
    id: '3',
    sender: 'info@southconsulting.com',
    subject: 'Commercial partnership for South',
    body: 'Dear Sirs,\n\nWe are a consulting company based in Sicily interested in a commercial partnership for the southern market.\n\nAvailable for a meeting.\n\nBest regards',
    aiSummary: 'Commercial partnership proposal from Sicilian company for South Italy market.',
    suggestedDepartment: 'South',
    confidence: 95,
    timestamp: new Date('2025-10-21T11:05:00'),
    attachments: ['company_presentation.pdf', 'proposal.docx'],
    status: 'not_processed',
    aiReasoning: 'Formal email from company based in Sicily proposing commercial collaboration for southern market. Clearly intended for the South department managing that geographic area.'
  },
  {
    id: '4',
    sender: 'mark.green@tech.com',
    subject: 'Urgent technical support',
    body: 'Good morning,\n\nWe are experiencing technical issues with your software. The system has not been starting correctly since this morning.\n\nWe request immediate assistance.\n\nMark Green',
    aiSummary: 'Urgent technical support request for software malfunction.',
    suggestedDepartment: 'Technical Support',
    confidence: 65,
    timestamp: new Date('2025-10-21T12:18:00'),
    attachments: ['error_screenshot.png'],
    status: 'analyzing'
  },
  {
    id: '5',
    sender: 'anna.brown@mail.com',
    subject: 'Re: Promotional offer',
    body: 'Thank you for the offer, I am interested but would need more details on the terms and conditions.\n\nAwaiting your response.',
    aiSummary: 'Response to promotional offer. Customer requesting clarification on terms and conditions.',
    suggestedDepartment: 'North',
    confidence: 88,
    timestamp: new Date('2025-10-21T13:45:00'),
    attachments: [],
    status: 'not_processed',
    aiReasoning: 'Response to a promotional offer with request for clarification. Generic context but likely handled by the North department that sent the original offer.'
  }
];
