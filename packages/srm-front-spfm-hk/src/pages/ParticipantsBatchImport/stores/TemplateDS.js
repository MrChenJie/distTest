/*
 * @Descripttion:
 * @version: 1.0.0
 * @Author: liuliyuan
 * @Email: liyuan.liu@hand-china.com
 * @Date: 2020-10-16 15:32
 * @LastEditors: liuliyuan
 * @LastEditTime: 2020-11-04
 */

const TemplateDS = () => ({
  autoQuery: false,
  fields: [{ name: 'template', type: 'string', lookupCode: 'SPFM.COMPANY_IMPORT_TEMPLATE' }],
});
export default TemplateDS;
