import {
  parseParameters,
  filterNullValueObject,
  getCurrentOrganizationId,
} from 'utils/utils';
import cusRequest from '_cus_utils/request';

const organizationId = getCurrentOrganizationId();

/**
 * 查询问卷调研
 *
 * @export
 * @returns
 */
export async function queryQuestionSurvey(params) {
  const query = filterNullValueObject(parseParameters(params));
  return cusRequest(`/srm-portal/v1/${organizationId}/portal-survey-question/search`, {
    method: 'GET',
    query,
  });
}
