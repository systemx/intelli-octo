import Renderer from '../renderer'

// FIXME: Add types
// import gitHubInjection from 'github-injection'
declare var require: any
const gitHubInjection = require('github-injection')

class GitHubRenderer extends Renderer {
  getCodeDOM() {
    return document.querySelector('.blob-wrapper table')
  }

  getCode() {
    // If we use document.querySelector('.blob-wrapper > table').innerText
    // Empty line in comment is missing
    // innerText behavior is different at FireFox, so use <td> instead of <tr>

    // Test case:
    // https://github.com/gorhill/uBlock/blob/master/platform/safari/vapi-background.js
    const trs = document.querySelectorAll('.blob-wrapper table td.blob-code')
    return [].map.call(trs, (line: Element) => {
      const text = (<HTMLElement>line).innerText
      if (text === '\n') {
        return ''
      }
      return text
    }).join('\n')
  }

  getFontDOM() {
    return this.$code.querySelector('span[class]')
  }

  getLineWidthAndHeight() {
    const rect = document.querySelector('#LC1').getBoundingClientRect()
    return {
      width: rect.width,
      height: rect.height
    }
  }

  getPadding() {
    const gutter = <HTMLElement>document.querySelector('#L1')
    return {
      left: gutter.getBoundingClientRect().width + 10,
      top: 0,
    }
  }

  getTabSize() {
    const lines = this.code.split('\n')

    let tabLine: number
    // let tabNumber = 0
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // Find the line start of tab
      if (line[0] !== '\t') {
        continue
      }
      // Get tab number
      tabLine = i
      // for (const char of line) {
      //   if (char !== '\t') {
      //     break
      //   }
      //   tabNumber++
      // }
      break
    }

    if (!tabLine) {
      return 8 // Default
    }

    const $line = document.querySelector(`#LC${tabLine + 1}`)
    const childs = $line.childNodes

    // (tabNumber * tabSize + charNumber) * fontWidth = width
    // So:
    // tabSize = ((width / fontWidth) - charNumber) / tabNumber
    let charNumber = 0
    let tabNumber = 0
    for (const $child of childs) {
      // Skip text node, get the first tag node
      if ($child.nodeName === '#text') {
        const text = $child.nodeValue
        for (let char of text) {
          if (char === '\t') {
            tabNumber++
          } else {
            charNumber++
          }
        }
        continue
      }
      const width = $child.getBoundingClientRect().left - $line.getBoundingClientRect().left - 10
      return Math.round(((width / this.fontWidth) - charNumber) / tabNumber)
    }
  }

  // renderSwitch() {
  //   const $actions = document.querySelector('.file-actions')
  //   const $switch = document.createElement('div')
  //   $switch.className = 'btn btn-sm'
  //   $switch.style.marginRight = '6px'
  //   $switch.addEventListener('click', () => {
  //     this.header.setState({
  //       occurrences: [],
  //       isDefinitionVisible: false,
  //       isQuickInfoVisible: false,
  //     })
  //     this.isOpen = !this.isOpen
  //   })
  //   $actions.insertBefore($switch, $actions.querySelector('.BtnGroup'))
  // }
}

gitHubInjection(window, (err: Error) => {
  if (err) throw err
  const renderer = new GitHubRenderer()
})
