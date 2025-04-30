import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

function handleDataSetChange({ record, value }) {
  /* eslint-disable */
  if (value == null) {
    record.data.categoryId = '';
    record.data.purBigCategory = '';
    record.data.purMediumCategory = '';
    record.data.purSmallCategory = '';
    record.data.productCode = '';
    record.data.productName = '';
  } else {
    record.data.categoryId = value.categoryId;
    record.data.purBigCategory = value.bigCategoryName;
    record.data.purMediumCategory = value.mediumCategoryName;
    record.data.purSmallCategory = value.smallCategoryName;
    record.data.productCode = value.categoryCode;
    record.data.productName = value.categoryName;
  }
  /* eslint-enable */
}

const getFormDSProps = () => ({
  name: 'contractForm',
  autoCreate: true,
  fields: [
    {
      name: 'categoryId',
      type: FieldType.number,
    },
    {
      name: 'purBigCategory',
      type: FieldType.string,
      label: intl.get('spcm.erp.view.price.markup.pur.big.category').d('采购大类'),
    },
    {
      name: 'purMediumCategory',
      type: FieldType.string,
      label: intl.get('spcm.erp.view.price.markup.pur.medium.category').d('采购中类'),
    },
    {
      name: 'purSmallCategory',
      type: FieldType.string,
      label: intl.get('spcm.erp.view.price.markup.pur.small.category').d('采购小类'),
    },
    {
      name: 'productCode',
      type: FieldType.string,
      label: intl.get('spcm.erp.view.price.markup.product.code').d('产品编码'),
    },
    {
      name: 'productName',
      // textField: 'code',
      type: FieldType.object,
      lovPara: { tenantId: getCurrentOrganizationId() },
      required: true,
      label: intl.get('spcm.erp.view.price.markup.product.name').d('产品名称'),
      lovCode: 'SMDM.ITEM_CATEGORY_LEVEL',
    },
  ],
  events: {
    update: handleDataSetChange,
  },
});

export default getFormDSProps;
