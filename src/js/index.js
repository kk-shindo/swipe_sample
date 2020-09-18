import 'reset-css'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../scss/style.scss'

const app = new Vue({
  el: '#app',
  data() {
    return {
      isSwipeAreaHidden: true,
      isModalHidden: true,
      selectedModalContent: '',
      defaultStyleTop: 400,
    }
  },
  methods: {
    /**
     * [data-swipe="panel"]の表示
     */
    showModalHandler(content) {
      this.isModalHidden = false
      this.selectedModalContent = content
    },
    /**
     * [data-swipe="panel"]の非表示
     */
    hideDetailHandler() {
      this.isModalHidden = true
      this.selectedModalContent = ''
      document.querySelector('[data-swipe="panel"]').scrollTop = 0
      document.querySelector('[data-swipe="inner"]').scrollTop = 0
    },
    /**
     * [data-modal="body"]の表示
     */
    showSwipePanelHandler() {
      const swipePanel = document.querySelector('[data-swipe="panel"]')

      this.isSwipeAreaHidden = false
      this.setDefaultHeight(swipePanel)
    },
    /**
     * [data-modal="body"]の非表示
     */
    hideSwipePanelHandler() {
      this.isSwipeAreaHidden = true
      // スタイルの設定
      const swipePanel = document.querySelector('[data-swipe="panel"]')
      swipePanel.removeAttribute('style')
      swipePanel.classList.remove('js-top_pos')
      swipePanel.scrollTop = 0
    },
    /**
     * デフォルトの高さを与える
     * @param el
     */
    setDefaultHeight(el) {
      if (el) {
        el.removeAttribute('style')
        el.style.top = `${this.defaultStyleTop}px`
      }
    },
    /**
     * スワイプ機能
     */
    setSwipe(nob, target) {
      const n = document.querySelectorAll(nob) // ノブ要素(コントローラにあたる要素)(パネル側でも操作できるようにしたため、targetも含む)
      const t = document.querySelector(target) // スワイプで移動する要素
      let s_Y // スワイプ開始時のYの値
      let e_Y // スワイプ終了時のYの値
      const dist = 50 // スワイプorタップ判別領域 (スワイプした距離が50px未満なら実行しない)
      const hideBorderPos = window.innerHeight - 125 // 画面した125px以下にスワイプしたらターゲットを隠す
      let touchDiff // スワイプ開始位置とターゲット要素のtopとの差
      const topBorderPos = '100px' // パネルのtopの上限
      const isTopPosClassName = 'js-top_pos' // パネル上限判定用のクラス名
      const removeTransitionClassName = 'js-remove_transition' // CSSトランジションをOFF用のクラス名
      let isFirst = false

      // スワイプ開始
      const handleTouchStart = (el) => {
        el.addEventListener('touchstart', function (e) {
          // 上部のとき実行しない(#order)
          // if (el.classList.contains('js-top_pos')) return
          let touchStartTop = t.style.top ? parseInt(t.style.top) : 0 // スワイプ開始時のターゲット要素のtop
          touchDiff = Math.abs(e.touches[0].pageY - touchStartTop)
          // スワイプ開始時のYの値を代入(指の位置とtopの差を引く)
          s_Y = e.touches[0].pageY - touchDiff
          // スワイプ中はCSSトランジションを切る
          t.classList.add(removeTransitionClassName)
          // ターゲットのtopを設定する
          t.style.top = `${s_Y}px`
          // 初期値として同じ値を入れる
          e_Y = s_Y
          isFirst = true
        }.bind(this))
      }

      // スワイプ中
      const handleTouchMove = (el) => {
        el.addEventListener('touchmove', function (e) {
          // 指の位置に応じた座標を取得し、スワイプ開始時の差を踏まえて値を代入する
          // 比較用
          e_Y = e.changedTouches[0].pageY - touchDiff

          // [data-swipe="inner"]を操作しているとき && パネルが上部のとき
          if (el.dataset.swipe == 'inner' && t.classList.contains(isTopPosClassName)) {
            if (
              (e_Y > s_Y && el.scrollTop == 0) // 下にスワイプ && リストが上限
              || (e_Y <= s_Y && parseInt(t.style.top) > parseInt(topBorderPos)) // 上にスワイプ
            ) {
              if (isFirst) {
                // 条件に一致するとき改めて差分を取る
                let touchStartTop = t.style.top ? parseInt(t.style.top) : 0 // スワイプ開始時のターゲット要素のtop
                // スワイプ開始時のYの値を代入(指の位置とtopの差を引く)
                touchDiff = Math.abs(e.changedTouches[0].pageY - touchStartTop)
                // 改めて座標を取得
                e_Y = e.changedTouches[0].pageY - touchDiff
                // 初回限定のため、フラグを回収する
                isFirst = false
                // インナーのスクロール禁止
                el.style.overflowY = 'hidden'
              }

              // ターゲットのtopを設定する
              t.style.top = `${e_Y}px`

            } else { // リストが上限でない
              // パネル位置が変わっていないため、数値を無効化
              e_Y = s_Y
              // インナーのスクロール禁止 解除
              el.removeAttribute('style')
            }
          } else {
            // デフォルトイベントを実行しない
            e.preventDefault()

            // ターゲットのtopを設定する
            t.style.top = `${e_Y}px`
          }
        }.bind(this))
      }

      // スワイプ終了
      const handleTouchEnd = (el) => {
        el.addEventListener('touchend', function (e) {
          // スワイプ完了時にCSSトランジションを設定する
          t.classList.remove(removeTransitionClassName)

          // インナーのスクロール禁止 解除
          if (el.dataset.swipe == 'inner') {
            el.removeAttribute('style')
          }

          // 移動距離が${dist}px未満だった場合は処理を行わない（前回の状態を引き継ぐ）
          if (Math.abs(s_Y - e_Y) < dist) {
            if (t.classList.contains(isTopPosClassName)) {
              // 「上にスクロールしたとき」と同じ
              t.style.top = topBorderPos
            } else {
              // 「下にスクロールしたとき」と同じ
              this.setDefaultHeight(t)
            }
            return
          }

          if (e_Y > hideBorderPos) { // 隠すボーダーラインより下にスクロールしたとき
            // [data-swipe="panel"]の非表示
            this.hideSwipePanelHandler()

          } else if (s_Y > e_Y + dist) { // 上にスクロールしたとき
            // ターゲット要素をを表示する
            this.isSwipeAreaHidden = false
            // ターゲットのtop位置を上限に設定する
            t.style.top = topBorderPos
            // 上部表示用のclassを加える
            t.classList.add(isTopPosClassName)

          } else if (s_Y + dist < e_Y) { // 下にスクロールしたとき
            // ターゲット要素をを表示する
            this.isSwipeAreaHidden = false
            // 上部表示用のclassを外す
            t.classList.remove(isTopPosClassName)
            // デフォルトの高さを設定する
            this.setDefaultHeight(t)
          }
        }.bind(this))
      }

      // それぞれのノブ要素にイベントを登録する
      for (let i = 0; i < n.length; i++) {
        handleTouchStart(n[i])
        handleTouchMove(n[i])
        handleTouchEnd(n[i])
      }
    }
  },
  mounted() {
    // スワイプ機能を起動
    this.setSwipe('[data-swipe="nob"], [data-swipe="inner"]', '[data-swipe="panel"]')
  }
})
