import { DocumentData } from './extraction.model';

export const MOCK_DOCUMENTS: DocumentData[] = [
  {
    project: 'Invoice Processing',
    validationStatus: 'Needs Validation',
    file: 'assets/pdfs/POT182209.pdf',
    fields: {
      poNumber: { value: 'T182209', confidence: 98, coords: { x: 420, y: 55, w: 40, h: 15 } },
      orderDate: { value: '17/10/2025', confidence: 94, coords: { x: 410, y: 68, w: 50, h: 15 } },
      companyName: { value: 'WESTRIDGE ENGINEERING SERVICES LTD', confidence: 92, coords: { x: 25, y: 58, w: 153, h: 23 } },
      amount: { value: '$261.00', confidence: 97, coords: { x: 413, y: 336, w: 50, h: 20 } }
    },
    tableCoords: { x: 21, y: 219, w: 439, h: 63 },
    lineItems: [
      { description: 'Industrial Gloves', qty: 1, amount: '$11' },
      { description: 'Paint Buckets (5L)', qty: 50, amount: '$250' }
    ]
  },
    {
      project: 'Payments & Disbursements',
      validationStatus: 'Needs Validation',
      file: 'assets/pdfs/PO1299488.pdf',
      fields: {
        poNumber: { value: 'PO1299488', confidence: 96, coords: { x: 367, y: 166, w: 65, h: 20 } },
        orderDate: { value: '', confidence: 0, coords: { x: 0, y: 0, w: 0, h: 0 } },
        companyName: { value: 'NORTHRIDGE INDUSTRIAL SOLUTIONS INC.', confidence: 90, coords: { x: 55, y: 70, w: 110, h: 53 } },
        amount: { value: '$220', confidence: 93, coords: { x: 395, y: 374, w: 31, h: 20 } }
      },
      tableCoords: { x: 54, y: 248, w: 383, h: 78 },
      lineItems: [
        { description: 'Concrete Bags (50 kg)', qty: 2, amount: '200' },
        { description: 'Electrical Cables (100m roll)', qty: 1, amount: '0' }
      ]
    },
    {
      project: 'Vendor Management',
      validationStatus: 'Needs Validation',
      file: 'assets/pdfs/PO110000.pdf',
      fields: {
        poNumber: { value: '110000', confidence: 99, coords: { x: 396, y: 100, w: 34, h: 18 } },
        orderDate: { value: '23/09/2025', confidence: 98, coords: { x: 395, y: 84, w: 55, h: 17 } },
        companyName: { value: 'GLOBAL PROCUREMENT LTD.', confidence: 95, coords: { x: 27, y: 68, w: 120, h: 20 } },
        amount: { value: '$1,375.50', confidence: 97, coords: { x: 409, y: 543, w: 45, h: 18 } }
      },
      tableCoords: { x: 27, y: 330, w: 426, h: 43 },
      lineItems: [
        { description: 'Small part for FUJITSU Inverter', qty: 10, amount: '$250.00' },
        { description: 'Lighting adapter', qty: 1, amount: '$75.00' }
      ]
    },
    {
      project: 'Vendor Management',
      validationStatus: 'Needs Validation',
      file: 'assets/pdfs/Purchase_Order_TwoPage.pdf',
      fields: {
        poNumber: { value: '110237', confidence: 99, coords: { x: 138, y: 116, w: 35, h: 18 } },
        orderDate: { value: '2025-10-26', confidence: 98, coords: { x: 75, y: 124, w: 40, h: 18 } },
        companyName: { value: 'NORTHRIDGE INDUSTRIAL SOLUTIONS INC.', confidence: 95, coords: { x: 73, y: 43, w: 345, h: 28 } },
        amount: { value: '$6,875.00', confidence: 97, coords: { x: 73, y: 132, w: 34, h: 13 , page: 2} }
      },
      // Two tables: first on page 1, second on page 2
      tableCoords: [
        { x: 25, y: 260, w: 430, h: 365, page: 1 },
        { x: 25, y: 58, w: 430, h: 50, page: 2 }
      ],
      lineItems: [
        { description: 'Small part for FUJITSU Inverter', qty: 10, amount: '$250.00' },
        { description: 'Lighting adapter', qty: 1, amount: '$75.00' }
      ]
    }
];
