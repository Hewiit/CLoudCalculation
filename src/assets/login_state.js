import id from "element-ui/src/locale/lang/id";

export const login_manager = {
    set: function(uid, name, avatar, identity){
        localStorage.setItem('roles', 'user');
        uid!==undefined ? localStorage.setItem('uid', uid) : '';
        name!==undefined ? localStorage.setItem('name', name) : '';
        avatar!==undefined ? localStorage.setItem('avatar', avatar) : '';
        identity!==undefined ? localStorage.setItem('identity', identity) : '';
    },
    get: function(){
        if(localStorage.getItem('uid')){
            return {
                uid: localStorage.getItem('uid'),
                name: localStorage.getItem('name'),
                avatar: localStorage.getItem('avatar'),
                identity: localStorage.getItem('identity'),
                roles: localStorage.getItem('roles'),
            };
        }
        else{
            return {};
        }
    },
    clear: function(){
        localStorage.removeItem('uid');
        localStorage.removeItem('name');
        localStorage.removeItem('avatar');
        localStorage.removeItem('identity');
        localStorage.removeItem('roles');
    },
}
