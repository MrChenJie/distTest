import cusRequest from '_cus_utils/request';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 邀请汇总查询
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryList(params) {
  const query = parseParameters(params);
  return cusRequest(`/srm-portal/v1/${organizationId}/invite-cooperate-infos/internal`, {
    method: 'GET',
    query,
  });
}
