import Draggable from "react-draggable"

const BIG_NUMBER = 123456789

export function RowSeparator({ parentId, index }) {
    const onSeparatorDrag = (ui) => {
        // Use parentId and index to identify the correct sections
        const parentElement = document.getElementById(parentId)
        const leftSelector = `.parent-${parentId}.index-${index}`
        const leftElement = document.querySelector(leftSelector)
        const rightSelector = `.parent-${parentId}.index-${index + 1}`
        const rightElement = document.querySelector(rightSelector)
        // Update the section's width or height based on the dragging movement
        if (parentElement && leftElement && rightElement) {
            const parentWidth = parentElement.offsetWidth
            const separatorPosition = BIG_NUMBER * ui.deltaX
            const newWidthPercentage = (separatorPosition / parentWidth) * 100

            // Update the width percentage CSS property of the leftElement
            const leftElementCurrentWidth =
                parseFloat(leftElement.style.width) || 0
            const newLeftWidth = Math.min(
                100,
                Math.max(0, leftElementCurrentWidth + newWidthPercentage)
            )
            console.log(`Left New Width: ${newLeftWidth}%`)
            leftElement.style.width = `${newLeftWidth}%`

            // Subtract the calculated percentage from the rightElement
            const rightElementCurrentWidth =
                parseFloat(rightElement.style.width) || 0
            const newRightWidth = Math.min(
                100,
                Math.max(0, rightElementCurrentWidth - newWidthPercentage)
            )
            console.log(`Right New Width: ${newRightWidth}%`)
            rightElement.style.width = `${newRightWidth}%`
        }
    }
    return (
        <Draggable
            axis="x"
            scale={BIG_NUMBER}
            onDrag={(_e, ui) => onSeparatorDrag(ui)}
        >
            <div
                className={`overflow-clip h-full w-2 hover:opacity-50 cursor-ew-resize grid place-content-center`}
            >
                <div className="w-0.5 rounded-full h-10 bg-slate-50"></div>
            </div>
        </Draggable>
    )
}

export function ColumnSeparator({ parentId, index }) {
    const onSeparatorDrag = (ui) => {
        // Use parentId and index to identify the correct sections
        const parentElement = document.getElementById(parentId)
        const topSelector = `.parent-${parentId}.index-${index}`
        const topElement = document.querySelector(topSelector)
        const bottomSelector = `.parent-${parentId}.index-${index + 1}`
        const bottomElement = document.querySelector(bottomSelector)
        // Update the section's width or height based on the dragging movement
        if (parentElement && topElement && bottomElement) {
            const parentHeight = parentElement.offsetHeight
            const separatorPosition = BIG_NUMBER * ui.deltaY
            const newHeightPercentage = (separatorPosition / parentHeight) * 100

            // Update the width percentage CSS property of the topElement
            const topElementCurrentHeight =
                parseFloat(topElement.style.height) || 0
            const newTopHeight = Math.min(
                100,
                Math.max(0, topElementCurrentHeight + newHeightPercentage)
            )
            console.log(`Top New Height: ${newTopHeight}%`)
            topElement.style.height = `${newTopHeight}%`

            // Subtract the calculated percentage from the bottomElement
            const bottomElementCurrentHeight =
                parseFloat(bottomElement.style.height) || 0
            const newBottomHeight = Math.min(
                100,
                Math.max(0, bottomElementCurrentHeight - newHeightPercentage)
            )
            console.log(`Bottom New Height: ${newBottomHeight}%`)
            bottomElement.style.height = `${newBottomHeight}%`
        }
    }
    return (
        <Draggable
            axis="y"
            scale={BIG_NUMBER}
            onDrag={(_e, ui) => onSeparatorDrag(ui)}
        >
            <div
                className={`overflow-clip w-full h-2 hover:opacity-50 cursor-ns-resize grid place-content-center`}
            >
                <div className="h-0.5 rounded-full w-10 bg-slate-50"></div>
            </div>
        </Draggable>
    )
}
