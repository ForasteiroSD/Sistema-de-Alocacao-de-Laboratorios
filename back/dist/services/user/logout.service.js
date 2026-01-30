import { clearAuthCookie } from '../../utils/auth.js';
export async function userLogout(req, res) {
    clearAuthCookie(res);
    return res.sendStatus(200);
}
//# sourceMappingURL=logout.service.js.map