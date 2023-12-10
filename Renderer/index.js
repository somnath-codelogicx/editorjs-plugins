import CustomEmbed from  './renderModules/embed'
import Header from './renderModules/header'
import Image from './renderModules/image'
import LineBreak from './renderModules/lineBreak'
import List from './renderModules/list'
import Paragraph from './renderModules/paragraph'

export default async function customRenderer(id, editorData) {
	const blocks = editorData.blocks
	const elementsArray = await prepareBlocks(blocks)
	const wrapper = await renderElements(elementsArray)
	// const holder = document.getElementById(id)
	// if (holder) holder.appendChild(wrapper)
}

function prepareBlocks(blocks) {
	return new Promise((resolve) => {
		let tempArr = []
		blocks.map(async (block, index) => {
			let blockType = null

			switch(block.type) {
				case "paragraph":
					blockType = new Paragraph(block.data)
					break
				case "list":
					blockType = new List(block.data)
					break
				case "embed":
					blockType = new CustomEmbed(block.data)
					break
				case "image":
					blockType = new Image(block.data)
					break
				case "header":
					blockType = new Header(block.data)
					break
				case "lineBreak":
					blockType = new LineBreak(block.data)
					break
			}
			if (blockType) {
				const el = await blockType.render()
				tempArr.push({el, index})
			}
		})
		resolve(tempArr)
	})
}

function renderElements(items) {
	const wrapper = document.createElement('DIV')
	// elements = elements.sort((a, b) => a.index - b.index)
	return new Promise((resolve) => {
		items.forEach((item) => {
			console.log(item)
			// wrapper.appendChild(item)
		})
		resolve(wrapper)
	})
}