import { ReactReader } from "react-reader";
interface Props {
	path: string;
}

const EpubReader = (props: Props) => {
    console.log(props);
    
	return (
		<ReactReader 
			url={props.path} 
			epubInitOptions={{ openAs: "epub" }} 
			location={null} 
			locationChanged={(epubcifi: string) => { console.log(epubcifi); }} 
		/>
	);
};

export default EpubReader;
