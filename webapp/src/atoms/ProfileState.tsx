import { recoilPersist } from 'recoil-persist'
import { atom } from 'recoil'
const { persistAtom } = recoilPersist()

export const profileState = atom({
    key: 'profile' ,
    default: {
        nickName: '',
        iconImage: '',
    },
    effects_UNSTABLE: [persistAtom]
});