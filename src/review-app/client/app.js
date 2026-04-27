import { API } from './ApiConstants.js'
import { Logo } from './graphics.js'
import { Filename } from './Filename.js'
import { t, Fragment, createElement as r } from './utils/dom.js'

import CSS from './app.css' with { type: 'css' }
import { extractClassNames, classNames } from './utils/css.js'
document.adoptedStyleSheets.push(CSS)
Object.assign(CSS, extractClassNames(CSS))

const store = {
	diffs: [],

	showDiff: false,
	toggleShowDiff() {
		store.showDiff = !store.showDiff
		render()
	},

	multiplyDiff: false,
	toggleMultiplyDiff() {
		store.multiplyDiff = !store.multiplyDiff
		render()
	},
	
	sideBySide: false,
	toggleSideBySide() {
		store.sideBySide = !store.sideBySide
		render()
	}
}

fetch(API.diffs).then(res => {
	if (res.ok)
		res.json().then(diffs => {
			store.diffs = diffs
			render()
		})
}).catch(error => alert(error))

function render() {
	document.body.replaceChildren(App())
}

document.addEventListener('keydown', event => {
	switch (event.key) {
		case 'd':
			store.toggleShowDiff()
			break
		case 'm':
			store.toggleMultiplyDiff()
			break
		case 's':
			store.toggleSideBySide()
			break
	}
})


function App() {
	return Fragment(
		r('header', null,
			Logo(CSS.Logo),
			ToggleDiffOverlayCheckbox(),
			ToggleDiffMultiplyCheckbox(),
			ToggleSideBySideCheckbox()),
		r('div', null, SectionsDiffs()))
}

function SectionsDiffs() {
	return store.diffs.length
		? store.diffs.map(Diff)
		: r('p', { className: CSS.NoDiffs }, t`No Diffs`)
}

function ToggleDiffOverlayCheckbox() {
	return Checkbox({
		label: Fragment(
			r('span', null, t`Show Diff`),
			r('kbd', null, 'D')),
		checked: store.showDiff,
		onChange: store.toggleShowDiff
	})
}

function ToggleDiffMultiplyCheckbox() {
	return Checkbox({
		label: Fragment(
			r('span', null, t`Multiply Diff`),
			r('kbd', null, 'M')),
		disabled: !store.showDiff || store.sideBySide,
		checked: store.multiplyDiff,
		onChange: store.toggleMultiplyDiff
	})
}

function ToggleSideBySideCheckbox() {
	return Checkbox({
		label: Fragment(
			r('span', null, t`Side-by-Side`),
			r('kbd', null, 'S')),
		checked: store.sideBySide,
		onChange: store.toggleSideBySide
	})
}




function Diff(diff) {
	const { title, viewport, colorScheme } = Filename.parse(diff)
	const candidate = Figure(Filename.candidateFromDiff(diff))
	const gold = Figure(Filename.goldFromDiff(diff))

	return (
		r('section', null,
			r('div', { className: CSS.Heading },
				r('button', {
					className: CSS.ApproveButton,
					async onClick() {
						try {
							await fetch(API.approve, {
								method: 'PATCH',
								body: JSON.stringify(diff)
							})
							window.location.reload()
						}
						catch (error) {
							alert(error)
						}
					}
				}, t`Approve`),
				r('div', null,
					Title(title),
					r('div', { className: CSS.details },
						r('span', null, viewport.replace('x', '×')),
						r('span', null, colorScheme)))
			),

			r('div', { className: classNames(CSS.Figures, store.sideBySide && CSS.sideBySide) },
				gold,
				candidate,
				store.showDiff && Figure(diff, store.multiplyDiff && !store.sideBySide && CSS.multiply),
				!store.sideBySide && OpacitySlider(candidate)
			)))
}

function OpacitySlider(candidate) {
	return (
		r('div', { className: CSS.OpacitySlider },
			r('span', null, t`Old`),
			r('input', {
				onInput() {
					candidate.style.opacity = this.valueAsNumber / 100
				},
				disabled: store.showDiff,
				title: store.showDiff ? t`Disabled when showing diff` : '',
				type: 'range',
				min: 0,
				step: 1,
				max: 100,
				value: 100
			}),
			r('span', null, t`New`)))
}

function Title(title) {
	const parts = title.split('/')
	return (
		r('div', { className: CSS.Title },
			parts.map(((p, i) =>
				r('span', null, p + (i < parts.length - 1 ? '/' : ''))))))
}


function Figure(src, className) {
	return (
		r('figure', null,
			r('img', { src, className })))
}


function Checkbox({ checked, onChange, label, className, disabled }) {
	return (
		r('label', { className: classNames(CSS.Checkbox, className) },
			r('input', {
				disabled,
				type: 'checkbox',
				checked,
				onChange
			}),
			r('span', null, label)))
}
