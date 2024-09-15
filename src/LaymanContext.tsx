import {createContext, useReducer, useState} from "react";
import {
    LaymanBranch,
    LaymanContextType,
    LaymanLayout,
    PaneRenderer,
    TabRenderer,
    LaymanLayoutAction,
} from "./types";
import _ from "lodash";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import React from "react";

// Define default values for the context
const defaultContextValue: LaymanContextType = {
    laymanRef: undefined,
    setLaymanRef: () => {},
    layout: [],
    layoutDispatch: () => {},
    renderPane: () => <></>,
    renderTab: () => <></>,
};

type LaymanProviderProps = {
    initialLayout: LaymanLayout;
    renderPane: PaneRenderer;
    renderTab: TabRenderer;
    children: React.ReactNode;
};

export const LaymanContext =
    createContext<LaymanContextType>(defaultContextValue);

const LayoutReducer = (
    layout: LaymanLayout,
    action: LaymanLayoutAction
): LaymanLayout => {
    switch (action.type) {
        case "addTab": {
            // Must have a tab to add
            if (!action.tab) return layout;

            if (_.isArray(layout)) {
                return [...layout, action.tab];
            }
            const layoutTabList: LaymanLayout = _.get(
                layout,
                action.path.join("."),
                []
            );
            if (_.isArray(layoutTabList)) {
                return _.set(_.cloneDeep(layout), action.path.join("."), [
                    ...layoutTabList,
                    action.tab,
                ]);
            }
            return layout;
        }
        case "removeTab": {
            // Must have a tab to add
            if (!action.tab) return layout;

            if (_.isArray(layout)) {
                return layout.filter((tab) => tab.id !== action.tab!.id);
            }
            const layoutTabList: LaymanLayout = _.get(
                layout,
                action.path.join("."),
                []
            );

            // If layoutTabList is not an array, return
            if (!_.isArray(layoutTabList)) return layout;

            // Reomve specified tab
            const updatedTabList = layoutTabList.filter(
                (tab) => tab.id !== action.tab!.id
            );

            // Check if the tab list is empty
            if (updatedTabList.length === 0) {
                // Get the parent path and parent layout
                const parentPath = _.dropRight(action.path);
                const parent: LaymanLayout = _.get(layout, parentPath);

                if (_.isArray(parent)) return layout;

                // Determine the side of the removed tab
                const side: LaymanBranch =
                    _.last(action.path) === "first" ? "second" : "first";
                const sibling = side === "first" ? parent.first : parent.second;

                if (sibling) {
                    // Replace parent with sibling and return new layout
                    if (parentPath.length > 0) {
                        return _.set(_.cloneDeep(layout), parentPath, sibling);
                    }
                    return _.cloneDeep(sibling);
                }
            }

            return _.set(
                _.cloneDeep(layout),
                action.path.join("."),
                updatedTabList
            );
        }
        case "selectTab": {
            // Must have a tab to add
            if (!action.tab) return layout;

            if (_.isArray(layout)) {
                return layout.map((tab) => {
                    return {
                        ...tab,
                        isSelected: tab.id === action.tab!.id,
                    };
                });
            }
            const layoutTabList: LaymanLayout = _.get(
                layout,
                action.path.join("."),
                []
            );
            if (_.isArray(layoutTabList)) {
                return _.set(
                    _.cloneDeep(layout),
                    action.path.join("."),
                    layoutTabList.map((tab) => {
                        return {
                            ...tab,
                            isSelected: tab.id === action.tab!.id,
                        };
                    })
                );
            }
            return layout;
        }
        case "addWindow": {
            // Must have a tab to add
            if (!action.tab) return layout;

            // Edge case: One window, turn layout from an array into an object
            if (_.isArray(layout)) {
                const newLayout: LaymanLayout = {
                    direction: action.direction!,
                    first: action.placement === "first" ? [action.tab] : layout,
                    second:
                        action.placement === "second" ? [action.tab] : layout,
                };
                return newLayout;
            }
            // Create the updater function based on the placement
            const updater =
                action.placement === "first"
                    ? (value: LaymanLayout) => ({
                          direction: action.direction,
                          first: [action.tab],
                          second: value,
                      })
                    : (value: LaymanLayout) => ({
                          direction: action.direction,
                          first: value,
                          second: [action.tab],
                      });

            // Update the layout in the state using a new object
            return _.set(
                _.cloneDeep(layout),
                action.path.join("."),
                updater(_.get(layout, action.path.join(".")))
            );
        }
        case "moveSeparator": {
            if (action.path.length == 0) {
                return {
                    ...layout,
                    splitPercentage: action.newSplitPercentage,
                };
            }
            const currentLayout = _.get(layout, action.path.join("."));
            if (!_.isArray(currentLayout)) {
                return _.set(
                    _.cloneDeep(layout),
                    `${action.path.join(".")}.splitPercentage`,
                    action.newSplitPercentage
                );
            }
            return layout;
        }
        default: {
            throw Error("Unknown action: " + action.type);
        }
    }
};

export const LaymanProvider = ({
    initialLayout,
    renderPane,
    renderTab,
    children,
}: LaymanProviderProps) => {
    // const [layout, setLayout] = useState<LaymanLayout>(initialLayout);
    const [layout, layoutDispatch] = useReducer(LayoutReducer, initialLayout);
    const [laymanRef, setLaymanRef] = useState<React.RefObject<HTMLElement>>();

    return (
        <LaymanContext.Provider
            value={{
                laymanRef,
                setLaymanRef,
                layout,
                layoutDispatch,
                renderPane,
                renderTab,
            }}
        >
            <DndProvider backend={HTML5Backend}>{children}</DndProvider>
        </LaymanContext.Provider>
    );
};
