import './ScrollyStep.css'

const ScrollyStep = ({text, image}) => {
    return (
        <div className="margins">
            <div className="content" style={{textAlign: 'center'}}>
                <div>{text}</div>
                { image ? <img src={image} height={400} width={400} /> : ''}
            </div>
        </div>
    )
}

export default ScrollyStep