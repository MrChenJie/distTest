
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();


// /spfm/v1/0/spfm-pur-header-ifs/queryImport?batchNum=202011160023
export async function queryData(payload) {
  const param = filterNullValueObject(parseParameters(payload));
  return request(`${SRM_PLATFORM}/v1/${organizationId}/spfm-pur-header-ifs/queryImport`, {
    method: 'GET',
    query: param,
  });
}
