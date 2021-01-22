import {
  isEmpty,
  map,
} from 'lodash';

import { exportCsv } from '@folio/stripes/util';

import { feeFineReportColumns } from '../../../constants';
import {
  getFullName,
  formatActionDescription,
  formatCurrencyAmount,
  formatDateAndTime,
  getServicePointOfCurrentAction,
  calculateRemainingAmount,
} from '../../util';

const getValue = (value) => value || '';

const extractComments = (action) => {
  const replacer = (comment, regexp) => comment.replace(regexp, '').trim();
  const comments = {};
  const actionComments = action.comments ? action.comments.split('\n') : [];

  actionComments.forEach((comment, index) => {
    switch (index) {
      case 0:
        comments.actionInfoStaff = replacer(comment, /STAFF :/i);
        break;
      case 1:
        comments.actionInfoPatron = replacer(comment, /PATRON :/i);
        break;
      default:
        comments.actionInfoStaff = '';
        comments.actionInfoPatron = '';
    }
  });

  return comments;
};

class FeeFineReport {
  constructor({ data, intl: { formatMessage, formatTime } }) {
    // data model:
    // data = {
    //  feeFineActions: [] - GET: 'feefineactions?query=(userId==:{id}&limit=${MAX_RECORDS})',
    //  accounts: [] - GET: 'accounts?query=(userId==:{id})&limit=${MAX_RECORDS}',
    //  loans: [] - GET: 'circulation/loans?query=(userId==:{id})&limit=1000',
    //  servicePoints: [] - props.okapi.currentUser.servicePoints
    //  patronGroup: 'group' - string,
    //  user: user - GET: 'users/:{id}',
    // }
    this.data = data;
    this.formatMessage = formatMessage;
    this.formatTime = formatTime;
    this.reportData = null;
    this.columnsMap = feeFineReportColumns.map(value => ({
      label: this.formatMessage({ id: `ui-users.reports.feeFine.${value}` }),
      value
    }));
  }

  buildReport() {
    const reportData = [];
    const {
      user = {},
      patronGroup = '',
      servicePoints = [],
      feeFineActions = [],
      accounts = [],
      loans = [],
    } = this.data;

    if (isEmpty(feeFineActions)) {
      return undefined;
    }

    map(feeFineActions, (action) => {
      const account = accounts.find(({ id }) => id === action.accountId);
      const loan = account.loanId ? loans.find(({ id }) => id === account.loanId) : {};
      const { actionInfoStaff, actionInfoPatron } = extractComments(action);
      const reportRowFormatter = {
        patronId: user.id,
        patronName: getFullName(user),
        patronBarcode: user.barcode,
        patronGroup,
        actionDate: formatDateAndTime(action.dateAction, this.formatTime),
        actionDescription: formatActionDescription(action),
        actionAmount: formatCurrencyAmount(action.amountAction),
        actionBalance: formatCurrencyAmount(action.balance),
        actionTransactionInfo: action.transactionInformation !== '-' ? action.transactionInformation : '',
        actionCreatedAt: getServicePointOfCurrentAction(action, servicePoints),
        actionSource: action.source,
        actionInfoStaff,
        actionInfoPatron,
        type: account.feeFineType,
        owner: account.feeFineOwner,
        billedDate: formatDateAndTime(account.metadata.createdDate, this.formatTime),
        billedAmount: account.amount ? formatCurrencyAmount(account.amount) : '',
        remainingAmount: calculateRemainingAmount(account.remaining),
        latestPaymentStatus: account.paymentStatus.name,
        itemInstance: getValue(account.title),
        itemMaterialType: getValue(account.materialType),
        itemBarcode: account.barcode ? account.barcode : '',
        itemId: getValue(account.itemId),
        itemInstanceId: getValue(account.instanceId),
        itemHoldingsRecordId: getValue(account.holdingsRecordId),
        itemCallNumber: getValue(account.callNumber),
        itemLocation: getValue(account.location),
        itemDueDate: account.dueDate ? formatDateAndTime(account.dueDate, this.formatTime) : '',
        itemReturnedDate: account.returnedDate ? formatDateAndTime(account.returnedDate, this.formatTime) : '',
        itemOverduePolicy: loan.overdueFinePolicy ? loan.overdueFinePolicy.name : '',
        itemOverduePolicyId: loan.overdueFinePolicyId ? loan.overdueFinePolicyId : '',
        itemLostPolicy: loan.lostItemPolicy ? loan.lostItemPolicy.name : '',
        itemLostPolicyId: loan.lostItemPolicyId ? loan.lostItemPolicyId : '',
        itemLoanDetail: getValue(loan.id),
        loanId: getValue(account.loanId),
      };

      reportData.push(reportRowFormatter);
    });

    return reportData;
  }

  parse() {
    this.reportData = this.buildReport();
    const origin = window.location.origin;

    return this.reportData.map(row => {
      return {
        ...row,
        patronBarcode: `=HYPERLINK("${origin}/users/preview/${row.patronId}", "${row.patronBarcode}")`,
        itemBarcode: `=HYPERLINK("${origin}/inventory/view/${row.itemInstanceId}/${row.itemHoldingsRecordId}/${row.itemId}", "${row.itemBarcode}")`,
        itemOverduePolicy: `=HYPERLINK("${origin}/settings/circulation/fine-policies/${row.itemOverduePolicyId}", "${row.itemOverduePolicy}")`,
        itemLostPolicy: `=HYPERLINK("${origin}/settings/circulation/lost-item-fee-policy/${row.itemLostPolicyId}", "${row.itemLostPolicy}")`,
        itemLoanDetails: `=HYPERLINK("${origin}/users/${row.patronId}/loans/view/${row.loanId}", "${row.loanId}")`,
      };
    });
  }

  toCSV() {
    const onlyFields = this.columnsMap;
    const parsedData = this.parse();

    exportCsv(parsedData, {
      onlyFields,
      filename: 'export-fees-fines-spreadsheet'
    });
  }
}

export default FeeFineReport;
