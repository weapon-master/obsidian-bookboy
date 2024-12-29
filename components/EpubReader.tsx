import { ReactReader } from "react-reader";
import { Rendition, Contents } from "epubjs";
import { useState, useRef, useEffect } from "react";
import { TFile, Vault } from "obsidian";

interface Props {
	path: string;
	vault: Vault;
}

type ITextSelection = {
	text: string;
	cfiRange: string;
};
// Example: https://github.com/gerhardsletten/react-reader/blob/main/src/examples/Selection.tsx
const EpubReader = (props: Props) => {
	const [selections, setSelections] = useState<ITextSelection[]>([]);
	const [rendition, setRendition] = useState<Rendition | null>(null);
	// const [location, setLocation] = useState<string | number>(0);
    
    useEffect(() => {
        if (rendition) {
          const setRenderSelection = (cfiRange: string, contents: Contents) => {
            if (rendition) {
              setSelections((list) =>
                list.concat({
                  text: rendition.getRange(cfiRange).toString(),
                  cfiRange,
                })
              )
              rendition.annotations.add(
                'highlight',
                cfiRange,
                {},
                (e: MouseEvent) => console.log('click on selection', cfiRange, e),
                'hl',
                { fill: 'red', 'fill-opacity': '0.5', 'mix-blend-mode': 'multiply' }
              )
              const selection = contents.window.getSelection()
              selection?.removeAllRanges()
            }
          }
          rendition.on('selected', setRenderSelection)
          return () => {
            rendition?.off('selected', setRenderSelection)
          }
        }
      }, [setSelections, rendition])

	return (
		<div className="epub-reader-container">
			<ReactReader
				url={props.path}
				epubInitOptions={{ openAs: "epub" }}
				location={null}
				locationChanged={(loc) => console.log(loc)}
				getRendition={(rendition) => {
					setRendition(rendition);
				}}
			/>
		</div>
	);
};

export default EpubReader;
