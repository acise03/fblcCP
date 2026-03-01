import { useCallback, useState } from "react";
import {
    Text,
    type NativeSyntheticEvent,
    type TextLayoutEventData,
    type TextStyle,
} from "react-native";

type ExpandableTextProps = {
  children: string;
  numberOfLines?: number;
  className?: string;
  style?: TextStyle;
};

export default function ExpandableText({
  children,
  numberOfLines = 4,
  className,
  style,
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const [measured, setMeasured] = useState(false);

  const onTextLayout = useCallback(
    (e: NativeSyntheticEvent<TextLayoutEventData>) => {
      if (!measured) {
        setNeedsTruncation(e.nativeEvent.lines.length > numberOfLines);
        setMeasured(true);
      }
    },
    [measured, numberOfLines],
  );

  return (
    <Text
      className={className}
      style={style}
      numberOfLines={
        !expanded && measured
          ? needsTruncation
            ? numberOfLines
            : undefined
          : undefined
      }
      onTextLayout={onTextLayout}
      onPress={needsTruncation ? () => setExpanded((v) => !v) : undefined}
    >
      {children}
      {needsTruncation && !expanded ? "  …read more" : ""}
    </Text>
  );
}
