import { recoilPersist } from 'recoil-persist'
import { atom } from 'recoil'
const { persistAtom } = recoilPersist()

export const googleOneTimeCodeState = atom({
    key: 'googleOneTimeCodeState',
    default: {
        code:'',
    },
    effects_UNSTABLE: [persistAtom]
});