import React from 'react'

const PageAdmin = ({ role, user }) => {
  return (
    <div className="alert alert-success">
        <h4 className="alert-heading">¡Bienvenido!</h4>
        <p>Has iniciado sesión correctamente como {role}.</p>
        <hr />
    </div>
  )
}

export default PageAdmin