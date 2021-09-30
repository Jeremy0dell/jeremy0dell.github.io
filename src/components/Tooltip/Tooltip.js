const Tooltip = ({title, place, weight, link}) =>
    <div style={{backgroundColor: 'white', padding: 10}}>
        {console.log('hi', title)}
        <h3 style={{marginTop: 0}}>{title}</h3>
        <div>Location: {place[0].content}</div>
        <div>Weight: {weight}g</div>
        {/* <a target="_blank" href={link}>Click to learn more!</a> */}
    </div>

export default Tooltip