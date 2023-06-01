import { defineStore } from 'pinia';
import Cookies from 'js-cookie';
import { CommentUserInfo, UserDTO } from '@/bean/dto';
import { LoginModel } from '@/bean/xhr';
import { userService } from '@/services/user';

interface RootState {
    isMenuVisible: boolean;
    commentUserInfo: CommentUserInfo | null;
    userInfo: UserDTO | null;
}

let commentUserInfo: CommentUserInfo | null = null;
const commentUserInfoInStorage = localStorage.getItem('commentUserInfo');
if (commentUserInfoInStorage) {
    commentUserInfo = JSON.parse(commentUserInfoInStorage);
}

let userInfo: UserDTO | null = null;
const userInfoInStorage = localStorage.getItem('userInfo');
if (userInfoInStorage) {
    userInfo = JSON.parse(userInfoInStorage);
}

export const useGlobalStore = defineStore('globalStore', {
    state: (): RootState => {
        return {
            isMenuVisible: false,
            commentUserInfo,
            userInfo
        };
    },
    getters: {
        isAuthed: (state) => !!state.userInfo
    },
    actions: {
        setIsMenuVisible(payload: boolean) {
            this.isMenuVisible = payload;
            // 展示侧边栏时，取消body的滚动条
            if (payload) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        },
        setCommontUserInfo(payload: CommentUserInfo) {
            if (payload) {
                this.commentUserInfo = payload;
                localStorage.setItem('commentUserInfo', JSON.stringify(payload));
            } else {
                this.commentUserInfo = null;
                localStorage.removeItem('commentUserInfo');
            }
        },
        setUserInfo(payload: UserDTO | null) {
            if (payload) {
                this.userInfo = payload;
                localStorage.setItem('userInfo', JSON.stringify(payload));
            } else {
                this.commentUserInfo = null;
                localStorage.removeItem('userInfo');
            }
        },
        async loginAction(payload: LoginModel) {
            const res = await userService.login(payload);
            const userInfo = res.data;
            this.setUserInfo(userInfo);
            return userInfo;
        },
        async logoutAction() {
            await userService.logout();
            this.setUserInfo(null);
        },
        checkAuthState() {
            const isLogined = Cookies.get('islogined');
            if (isLogined !== '1') {
                this.setUserInfo(null);
            } else {
                userService.current().then((res: { data: UserDTO }) => {
                    this.setUserInfo(res.data);
                });
            }
        }
    }
});
