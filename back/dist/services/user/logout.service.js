import { clearAuthCookie } from '../../utils/auth.js';
export async function userLogout(req, res) {
    clearAuthCookie(res);
    return res.status(200).send({
        success: true
    });
}
//# sourceMappingURL=logout.service.js.map