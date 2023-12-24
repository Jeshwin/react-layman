import { Fragment } from "react"
import { ColumnSeparator, RowSeparator } from "./separator"
import { Row, Column } from "./layout"
import { Window } from "./window"

export default function WindowManager({ initialLayout }) {
    const renderSection = (section, index, width = 1, height = 1) => {
        switch (section.type) {
            case "window": {
                return (
                    <Window
                        key={index}
                        id={`${section.type}-${section.id}-${index}`}
                        title={section.title}
                        width={width}
                        height={height}
                    >
                        {section.id}
                    </Window>
                )
            }
            case "row": {
                const sectionWidth = 1 / section.sections.length
                return (
                    <Row
                        key={index}
                        id={`${section.type}-${section.id}-${index}`}
                        width={width}
                        height={height}
                    >
                        {section.sections.map((subSection, subIndex) => (
                            <Fragment key={subIndex}>
                                {renderSection(
                                    subSection,
                                    subIndex,
                                    sectionWidth,
                                    1
                                )}
                                {subIndex < section.sections.length - 1 && (
                                    <RowSeparator
                                        id={`${section.type}-${section.id}-separator-${subIndex}`}
                                    />
                                )}
                            </Fragment>
                        ))}
                    </Row>
                )
            }
            case "column": {
                const sectionHeight = 1 / section.sections.length
                return (
                    <Column
                        key={index}
                        id={`${section.type}-${section.id}-${index}`}
                        width={width}
                        height={height}
                    >
                        {section.sections.map((subSection, subIndex) => (
                            <Fragment key={subIndex}>
                                {renderSection(
                                    subSection,
                                    subIndex,
                                    1,
                                    sectionHeight
                                )}
                                {subIndex < section.sections.length - 1 && (
                                    <ColumnSeparator
                                        id={`${section.type}-${section.id}-separator-${subIndex}`}
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
