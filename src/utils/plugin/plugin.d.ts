/* eslint-disable @typescript-eslint/interface-name-prefix */
import Vue from 'vue'
import { IDevOptionsItem } from '@/types/dev'
import { LoDashStatic } from 'lodash'
// plugin
declare module 'vue/types/vue' {
    interface Vue {
      $dp: (optionsList: IDevOptionsItem[] | string[], vm: Vue) => void
      $_: LoDashStatic
      $isProduction: boolean
    }
}
