import { Fragment } from "react"
import { ColumnSeparator, RowSeparator } from "./separator"
import { Row, Column } from "./layout"
import { Window } from "./window"
import { nanoid } from "nanoid"

export default function WindowManager({ initialLayout }) {
    const renderSection = (
        section,
        index = "none",
        parent = "none",
        width = 1,
        height = 1
    ) => {
        const className = `parent-${parent} index-${index}`
        switch (section.type) {
            case "window": {
                const windowId = nanoid()
                return (
                    <Window
                        key={index}
                        id={windowId}
                        className={className}
                        title={section.title}
                        width={width}
                        height={height}
                    >
                        {windowId}
                    </Window>
                )
            }
            case "row": {
                const sectionWidth = 1 / section.sections.length
                const rowId = nanoid()
                return (
                    <Row
                        key={index}
                        id={rowId}
                        className={className}
                        width={width}
                        height={height}
                    >
                        {section.sections.map((subSection, subIndex) => (
                            <Fragment key={subIndex}>
                                {renderSection(
                                    subSection,
                                    subIndex,
                                    rowId,
                                    sectionWidth,
                                    1
                                )}
                                {subIndex < section.sections.length - 1 && (
                                    <RowSeparator
                                        parentId={rowId}
                                        index={subIndex}
                                    />
                                )}
                            </Fragment>
                        ))}
                    </Row>
                )
            }
            case "column": {
                const sectionHeight = 1 / section.sections.length
                const colId = nanoid()
                return (
                    <Column
                        key={index}
                        id={colId}
                        className={className}
                        width={width}
                        height={height}
                    >
                        {section.sections.map((subSection, subIndex) => (
                            <Fragment key={subIndex}>
                                {renderSection(
                                    subSection,
                                    subIndex,
                                    colId,
                                    1,
                                    sectionHeight
                                )}
                                {subIndex < section.sections.length - 1 && (
                                    <ColumnSeparator
                                        parentId={colId}
                                        index={subIndex}
                                    />
                                )}
                            </Fragment>
                        ))}
                    </Column>
                )
            }
            default: {
                return null
            }
        }
    }
    return (
        <div className="h-[calc(100vh-128px)]">
            {renderSection(initialLayout, 0)}
        </div>
    )
}
