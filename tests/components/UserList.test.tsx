import { render, screen } from '@testing-library/react'
import UserList from '../../src/components/UserList';
import { User } from '../../src/entities';


describe('UserList', () => {
    it('如果没有用户数组，应该渲染一段文字', () => {
        render(<UserList users={[]}/>)
        expect(screen.getByText(/no users/i)).toBeInTheDocument();
    })
    it('应该渲染用户列表', () => {
        const users:User[] =[
            {id:1,name:"Mosh"},
            {id:2,name:"John"},
        ]
        render(<UserList users={users}/>)
        users.forEach(user =>{
            const link = screen.getByRole("link",{name:user.name});
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute("href",`/users/${user.id}`)
        })
    })
})