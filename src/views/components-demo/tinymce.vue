<template>
  <div class="components-container">
    <div>
      <tinymce
        v-if="tinymceActive"
        v-model="content"
        :height="500"
      />
    </div>

    <!-- eslint-disable vue/no-v-html -->
    <div
      class="editor-content"
      v-html="previewContent"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Tinymce from '@/components/Tinymce/index.vue'

@Component({
  name: 'TinymceDemo',
  components: {
    Tinymce
  }
})
export default class extends Vue {
  private dict: {[prop: string]: string} = {
    a: 'AA',
    b: 'BB',
  }

  private content =`
  <p id="ok">okokok</p>
{%a%}
  `

  get previewContent() {
    return this.genPreviewFromTemplate(this.content)
  }

  // <input class="editor-template" placeholder="请输入: ${this.dict[m1] || ''}" data-key="${m1 || ''}"/>
  // template preview
  genPreviewFromTemplate(text: string): string {
    return text.replace(/\{%(.*?)%\}/g, (_, m1) => {
      return `<input class="editor-template" placeholder="请输入: ${this.dict[m1] || ''}" value="sdfsdfasd;f sd fl;asdjfals;dfjasl;dfjasdlk;fjasdl;kfjasdlf;ajsdf" contenteditable data-key="${m1 || ''}"/>`
    })
  }

  // message-filled content preview
  // genPreviewFromContent(text: string): string {

  // }

  private tinymceActive = true

  private ok = 123

  deactivated() {
    this.tinymceActive = false
  }

  activated() {
    this.tinymceActive = true
  }

  created() {
    this.$dp([{
      name: 'content',
      routes: ['*'],
    }], this)
  }
}
</script>

<style lang="scss" scoped>
.editor-content::v-deep {
  margin-top: 20px;

  & input.editor-template {
    outline: none;
    border-style: none;
    display: inline-block;
    border-bottom: 2px solid black;
    padding: 10px 10px;
    margin: 0 10px;
    text-align: center;
    align-self: center;
    font-size: 18px;
    min-width: 150px;
    height: 1em;
    overflow: auto;
    &::placeholder{
      font-size: 16px;
    }
  }

}

</style>
