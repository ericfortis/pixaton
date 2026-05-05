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
	},

	async fetchDiffs() {
		try {
			const res = await fetch(API.diffs)
			if (res.ok) {
				store.diffs = await res.json()
				render()
			}
		}
		catch (err) {
			alert(err)
		}
	},

	async approve(diff) {
		try {
			await fetch(API.approve, {
				method: 'PATCH',
				body: JSON.stringify(diff)
			})
			await store.fetchDiffs()
		}
		catch (err) {
			alert(err)
		}
	}
}

store.fetchDiffs()

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
			r('span', null, t`Diff`),
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
	const candidate = Figure(Filename.candidateFromDiff(diff))
	return (
		r('section', null,
			r('div', { className: CSS.Heading },
				r('button', {
					className: CSS.ApproveButton,
					onClick() {
						store.approve(diff)
					}
				}, t`Approve`),
				r('div', null,
					Title(diff),
					!store.sideBySide && OpacitySlider(candidate))
			),

			r('div', { className: classNames(CSS.Figures, store.sideBySide && CSS.sideBySide) },
				Figure(Filename.goldFromDiff(diff)),
				candidate,
				store.showDiff && Figure(diff, store.multiplyDiff && !store.sideBySide && CSS.multiply),
			)))
}

function Title(diff) {
	const { title, viewport, colorScheme } = Filename.parse(diff)
	const parts = title.split('/')
	return (
		r('div', { className: CSS.Title },
			parts.map(((p, i) =>
				r('span', null, p + (i < parts.length - 1 ? '/' : '')))),

			r('div', { className: CSS.details },
				r('span', null, viewport.replace('x', '×')),
				r('span', null, colorScheme))))
}

function OpacitySlider(candidate) {
	const inputRef = {}
	const checkboxRef = {}
	return (
		r('div', { className: CSS.OpacitySliderGroup },
			r('input', {
				ref: inputRef,
				disabled: store.showDiff,
				title: store.showDiff ? t`Disabled when showing diff` : '',
				type: 'range',
				min: 0,
				step: 1,
				max: 100,
				value: 100,
				onInput() {
					candidate.style.opacity = this.valueAsNumber / 100
					checkboxRef.elem.checked = this.valueAsNumber === 100
				}
			}),
			Checkbox({
				ref: checkboxRef,
				label: t`Candidate`,
				disabled: store.showDiff,
				checked: inputRef.elem.valueAsNumber === 100,
				onChange() {
					inputRef.elem.value = inputRef.elem.valueAsNumber < 100 ? 100 : 0
					inputRef.elem.dispatchEvent(new Event('input'))
				}
			})))
}


function Figure(src, className) {
	return (
		r('figure', null,
			r('img', { src, className })))
}


function Checkbox({ ref, checked, onChange, label, className, disabled }) {
	return (
		r('label', { className: classNames(CSS.Checkbox, className) },
			r('input', {
				ref,
				disabled,
				type: 'checkbox',
				checked,
				onChange
			}),
			r('span', null, label)))
}
