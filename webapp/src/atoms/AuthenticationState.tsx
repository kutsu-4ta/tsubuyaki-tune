import { recoilPersist } from 'recoil-persist'
import { atom } from 'recoil'
const { persistAtom } = recoilPersist()

export const authenticationState = atom({
    key: 'authentication' ,
    default: {
        uid:'',
        credential:'',
        token:'',
        email:''
    },
    effects_UNSTABLE: [persistAtom]
});